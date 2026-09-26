/**
 * WebSerial API Hardware Bridge for LabVerse Virtual Laboratory
 * Connects directly to Arduino, ESP32, Raspberry Pi Pico, or external DAQ boards
 * via browser WebSerial API (navigator.serial).
 */

export interface SerialTelemetryData {
  raw: string;
  timestamp: number;
  parameters: Record<string, number>;
  metrics: Record<string, number>;
}

export type SerialDataListener = (data: SerialTelemetryData) => void;
export type SerialStatusListener = (status: 'disconnected' | 'connecting' | 'connected' | 'error', errorMsg?: string) => void;

class WebSerialManager {
  private port: any = null;
  private reader: any = null;
  private keepReading = false;
  private status: 'disconnected' | 'connecting' | 'connected' | 'error' = 'disconnected';
  private dataListeners: Set<SerialDataListener> = new Set();
  private statusListeners: Set<SerialStatusListener> = new Set();

  /**
   * Check if WebSerial API is supported in current browser environment
   */
  public isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'serial' in navigator;
  }

  public getStatus(): 'disconnected' | 'connecting' | 'connected' | 'error' {
    return this.status;
  }

  private setStatus(status: 'disconnected' | 'connecting' | 'connected' | 'error', errorMsg?: string) {
    this.status = status;
    this.statusListeners.forEach(listener => listener(status, errorMsg));
  }

  public onData(listener: SerialDataListener): () => void {
    this.dataListeners.add(listener);
    return () => this.dataListeners.delete(listener);
  }

  public onStatus(listener: SerialStatusListener): () => void {
    this.statusListeners.add(listener);
    return () => this.statusListeners.delete(listener);
  }

  /**
   * Prompt user to select USB Serial device and open communication stream
   */
  public async connect(baudRate: number = 115200): Promise<boolean> {
    if (!this.isSupported()) {
      this.setStatus('error', 'WebSerial API not supported in this browser. Please use Google Chrome, Microsoft Edge, or Opera.');
      return false;
    }

    try {
      this.setStatus('connecting');
      // @ts-ignore - navigator.serial Web API
      this.port = await navigator.serial.requestPort();
      await this.port.open({ baudRate });
      this.keepReading = true;
      this.setStatus('connected');

      // Start continuous background stream reader
      this.readStream();
      return true;
    } catch (err: any) {
      console.warn('WebSerial Connection error:', err);
      this.setStatus('disconnected', err.message || 'Device connection cancelled or unavailable');
      return false;
    }
  }

  /**
   * Stream reader loop with text line buffering and parser
   */
  private async readStream() {
    let lineBuffer = '';

    while (this.port && this.port.readable && this.keepReading) {
      try {
        const textDecoder = new TextDecoderStream();
        // @ts-ignore
        const readableStreamClosed = this.port.readable.pipeTo(textDecoder.writable);
        this.reader = textDecoder.readable.getReader();

        while (true) {
          const { value, done } = await this.reader.read();
          if (done) break;
          if (value) {
            lineBuffer += value;
            const lines = lineBuffer.split(/\r?\n/);
            lineBuffer = lines.pop() || ''; // keep incomplete chunk

            for (const line of lines) {
              const trimmed = line.trim();
              if (trimmed.length > 0) {
                this.parseAndDispatch(trimmed);
              }
            }
          }
        }
      } catch (err) {
        console.warn('WebSerial stream read error:', err);
        break;
      } finally {
        if (this.reader) {
          try {
            this.reader.releaseLock();
          } catch (e) { /* ignore */ }
        }
      }
    }

    this.setStatus('disconnected');
  }

  /**
   * Parse incoming serial string (supports JSON, KEY:VAL, or CSV pairs)
   */
  private parseAndDispatch(raw: string) {
    const params: Record<string, number> = {};
    const metrics: Record<string, number> = {};

    // 1. Try JSON format: {"voltage": 5.0, "current": 0.25, "temp": 32.5}
    if (raw.startsWith('{') && raw.endsWith('}')) {
      try {
        const parsed = JSON.parse(raw);
        for (const [k, v] of Object.entries(parsed)) {
          if (typeof v === 'number') {
            params[k] = v;
            metrics[k] = v;
          }
        }
      } catch (e) {
        // Fallback to key-val
      }
    }

    // 2. Key-Value format: "V:5.0,R:20.0" or "TEMP:45.2" or "POT:512"
    if (Object.keys(params).length === 0) {
      const parts = raw.split(/[,;\t]/);
      for (const part of parts) {
        const [k, v] = part.split(/[:=]/).map(s => s.trim());
        if (k && v !== undefined) {
          const num = parseFloat(v);
          if (!isNaN(num)) {
            const lowerK = k.toLowerCase();
            params[lowerK] = num;
            metrics[lowerK] = num;
            if (lowerK === 'v' || lowerK === 'volt' || lowerK === 'voltage') params['voltage'] = num;
            if (lowerK === 'r' || lowerK === 'res' || lowerK === 'resistance') params['resistance'] = num;
            if (lowerK === 'i' || lowerK === 'curr' || lowerK === 'current') metrics['current'] = num;
            if (lowerK === 't' || lowerK === 'temp' || lowerK === 'temperature') params['temperature'] = num;
          }
        }
      }
    }

    const payload: SerialTelemetryData = {
      raw,
      timestamp: Date.now(),
      parameters: params,
      metrics: metrics,
    };

    this.dataListeners.forEach(listener => listener(payload));
  }

  /**
   * Safely disconnect serial port
   */
  public async disconnect(): Promise<void> {
    this.keepReading = false;
    if (this.reader) {
      try {
        await this.reader.cancel();
      } catch (e) { /* ignore */ }
    }
    if (this.port) {
      try {
        await this.port.close();
      } catch (e) { /* ignore */ }
      this.port = null;
    }
    this.setStatus('disconnected');
  }

  /**
   * Send ASCII command to microcontroller
   */
  public async write(command: string): Promise<boolean> {
    if (!this.port || !this.port.writable) return false;
    try {
      const textEncoder = new TextEncoder();
      const writer = this.port.writable.getWriter();
      await writer.write(textEncoder.encode(command + '\n'));
      writer.releaseLock();
      return true;
    } catch (e) {
      console.error('Serial write error:', e);
      return false;
    }
  }
}

export const webSerialManager = new WebSerialManager();
