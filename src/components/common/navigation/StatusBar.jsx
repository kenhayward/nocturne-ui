import { useState, useEffect } from "react";
import { SignalLowIcon, BatteryIcon } from "@/components/icons";

const StatusBar = () => {
  const [currentTime, setCurrentTime] = useState("");
  const [isFourDigits, setIsFourDigits] = useState(false);
  const [isBluetoothTethered, setIsBluetoothTethered] = useState(false);
  const [batteryPercentage, setBatteryPercentage] = useState(80);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:5000/ws");

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "bluetooth/network") {
        setIsBluetoothTethered(true);
      }
    };

    ws.onerror = () => {
      setIsBluetoothTethered(false);
    };

    ws.onclose = () => {
      setIsBluetoothTethered(false);
    };

    const checkBatteryPercentage = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/bluetooth/devices",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        
        if (response.ok) {
          const devices = await response.json();
          const connectedDevice = devices.find(device => device.connected);
          if (connectedDevice?.batteryPercentage) {
            setBatteryPercentage(connectedDevice.batteryPercentage);
            setIsBluetoothTethered(true);
          } else {
            setIsBluetoothTethered(false);
          }
        }
      } catch (error) {
        console.error("Failed to fetch battery percentage:", error);
      }
    };

    checkBatteryPercentage();
    const batteryCheckInterval = setInterval(checkBatteryPercentage, 60000);

    return () => {
      ws.close();
      clearInterval(batteryCheckInterval);
    };
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const use24Hour = localStorage.getItem("use24HourTime") === "true";

      let hours;
      if (use24Hour) {
        hours = now.getHours().toString().padStart(2, "0");
        setIsFourDigits(true);
      } else {
        hours = now.getHours() % 12 || 12;
        setIsFourDigits(hours >= 10);
      }

      const minutes = now.getMinutes().toString().padStart(2, "0");
      const timeString = `${hours}:${minutes}`;
      setCurrentTime(timeString);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    const handleTimeFormatChange = () => {
      updateTime();
    };

    window.addEventListener("timeFormatChanged", handleTimeFormatChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener("timeFormatChanged", handleTimeFormatChange);
    };
  }, []);

  if (!isBluetoothTethered) return null;

  return (
    <div
      className={`flex justify-between w-full mb-6 pr-10 ${
        isFourDigits ? "pl-0.5" : "pl-2"
      } items-start`}
    >
      <div
        className="text-[26px] font-[580] text-white tracking-tight leading-none"
        style={{ margin: 0, padding: 0, marginTop: "-1px" }}
      >
        {currentTime}
      </div>
      <div className="flex gap-2.5 h-10" style={{ marginTop: "-10px" }}>
        <SignalLowIcon
          className="w-8 h-10"
          style={{
            margin: 0,
            padding: 0,
            display: "block",
            transform: "translateY(-10px)",
          }}
        />
        <BatteryIcon
          className="w-10 h-10"
          percentage={batteryPercentage}
          style={{
            margin: 0,
            padding: 0,
            display: "block",
            transform: "translateY(-10px)",
          }}
        />
      </div>
    </div>
  );
};

export default StatusBar;
