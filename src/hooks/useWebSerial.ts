'use client';

import { useState, useEffect, useCallback } from 'react';
import { webSerialManager, SerialTelemetryData } from '@/lib/hardware/webserial';

export function useWebSerial(onTelemetry?: (data: SerialTelemetryData) => void) {
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>(webSerialManager.getStatus());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastData, setLastData] = useState<SerialTelemetryData | null>(null);
  const [isSupported, setIsSupported] = useState<boolean>(true);

  useEffect(() => {
    setIsSupported(webSerialManager.isSupported());

    const unsubscribeStatus = webSerialManager.onStatus((newStatus, errorMsg) => {
      setStatus(newStatus);
      if (errorMsg) setErrorMessage(errorMsg);
      else if (newStatus === 'connected') setErrorMessage(null);
    });

    const unsubscribeData = webSerialManager.onData((data) => {
      setLastData(data);
      if (onTelemetry) {
        onTelemetry(data);
      }
    });

    return () => {
      unsubscribeStatus();
      unsubscribeData();
    };
  }, [onTelemetry]);

  const connect = useCallback(async (baudRate: number = 115200) => {
    setErrorMessage(null);
    return await webSerialManager.connect(baudRate);
  }, []);

  const disconnect = useCallback(async () => {
    await webSerialManager.disconnect();
  }, []);

  const sendCommand = useCallback(async (cmd: string) => {
    return await webSerialManager.write(cmd);
  }, []);

  return {
    status,
    errorMessage,
    lastData,
    isSupported,
    connect,
    disconnect,
    sendCommand,
  };
}
