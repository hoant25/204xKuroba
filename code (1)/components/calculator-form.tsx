"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface CalculatorFormProps {
  ipAddress: string
  setIpAddress: (value: string) => void
  prefixLength: string
  setPrefixLength: (value: string) => void
  ipVersion: "ipv4" | "ipv6"
  setIpVersion: (value: "ipv4" | "ipv6") => void
}

export default function CalculatorForm({
  ipAddress,
  setIpAddress,
  prefixLength,
  setPrefixLength,
  ipVersion,
  setIpVersion,
}: CalculatorFormProps) {
  return (
    <div className="space-y-6">
      {/* IP Version Selection */}
      <div className="flex gap-6">
        <div className="flex items-center gap-2">
          <input
            type="radio"
            id="ipv4"
            name="ip-version"
            value="ipv4"
            checked={ipVersion === "ipv4"}
            onChange={(e) => setIpVersion(e.target.value as "ipv4" | "ipv6")}
            className="w-4 h-4 accent-blue-500 cursor-pointer"
          />
          <label htmlFor="ipv4" className="text-slate-300 cursor-pointer">
            IPv4
          </label>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="radio"
            id="ipv6"
            name="ip-version"
            value="ipv6"
            checked={ipVersion === "ipv6"}
            onChange={(e) => setIpVersion(e.target.value as "ipv4" | "ipv6")}
            className="w-4 h-4 accent-blue-500 cursor-pointer"
          />
          <label htmlFor="ipv6" className="text-slate-300 cursor-pointer">
            IPv6
          </label>
        </div>
      </div>

      {/* Input Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="ip-address" className="text-slate-300">
            IP address
          </Label>
          <Input
            id="ip-address"
            placeholder="192.168.1.10"
            value={ipAddress}
            onChange={(e) => setIpAddress(e.target.value)}
            className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="prefix-length" className="text-slate-300">
            Prefix length
          </Label>
          <Input
            id="prefix-length"
            placeholder="24"
            value={prefixLength}
            onChange={(e) => setPrefixLength(e.target.value)}
            className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  )
}
