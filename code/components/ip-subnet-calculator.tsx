"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import CalculatorForm from "./calculator-form"
import ResultsDisplay from "./results-display"
import SubnetSplitter from "./subnet-splitter"

export default function IPSubnetCalculator() {
  const [ipAddress, setIpAddress] = useState("192.168.1.10")
  const [prefixLength, setPrefixLength] = useState("24")
  const [ipVersion, setIpVersion] = useState<"ipv4" | "ipv6">("ipv4")
  const [results, setResults] = useState(null)
  const [errorMessage, setErrorMessage] = useState("")
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"results" | "subnets">("results")

  const calculateSubnet = () => {
    setErrorMessage("")
    setResults(null)
    setActiveTab("results")

    if (!ipAddress.trim() || !prefixLength.trim()) {
      setErrorMessage("Chưa có kết quả — nhập IP & prefix rồi bấm Calculate.")
      return
    }

    try {
      if (ipVersion === "ipv4") {
        const result = calculateIPv4Subnet(ipAddress, Number.parseInt(prefixLength))
        setResults(result)
      } else {
        const result = calculateIPv6Subnet(ipAddress, Number.parseInt(prefixLength))
        setResults(result)
      }
    } catch (error) {
      setErrorMessage("Invalid IP address or prefix length")
    }
  }

  const resetForm = () => {
    setIpAddress("192.168.1.10")
    setPrefixLength("24")
    setResults(null)
    setErrorMessage("Chưa có kết quả — nhập IP & prefix rồi bấm Calculate.")
    setActiveTab("results")
  }

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(fieldName)
    setTimeout(() => setCopiedField(null), 2000)
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-4xl border border-slate-700 bg-slate-800 shadow-xl">
        <div className="p-8 space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-white">IP Subnet Calculator</h1>
            <p className="text-sm text-slate-400">Theme: Dark Grey • Platform: React • Full Features</p>
          </div>

          {/* Form */}
          <CalculatorForm
            ipAddress={ipAddress}
            setIpAddress={setIpAddress}
            prefixLength={prefixLength}
            setPrefixLength={setPrefixLength}
            ipVersion={ipVersion}
            setIpVersion={setIpVersion}
          />

          {/* Buttons */}
          <div className="flex gap-3">
            <Button onClick={calculateSubnet} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-medium">
              Calculate
            </Button>
            <Button
              onClick={resetForm}
              variant="outline"
              className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white bg-transparent"
            >
              Reset
            </Button>
          </div>

          {/* Results or Message */}
          {errorMessage && !results && (
            <div className="p-4 bg-slate-700 border border-slate-600 rounded-lg text-slate-300 text-sm">
              {errorMessage}
            </div>
          )}

          {results && (
            <>
              <div className="flex gap-2 border-b border-slate-700">
                <button
                  onClick={() => setActiveTab("results")}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === "results"
                      ? "text-blue-400 border-b-2 border-blue-400"
                      : "text-slate-400 hover:text-slate-300"
                  }`}
                >
                  Results
                </button>
                {ipVersion === "ipv4" && (
                  <button
                    onClick={() => setActiveTab("subnets")}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      activeTab === "subnets"
                        ? "text-blue-400 border-b-2 border-blue-400"
                        : "text-slate-400 hover:text-slate-300"
                    }`}
                  >
                    Subnet Splitter
                  </button>
                )}
              </div>

              {activeTab === "results" && (
                <ResultsDisplay
                  results={results}
                  ipVersion={ipVersion}
                  onCopy={copyToClipboard}
                  copiedField={copiedField}
                />
              )}

              {activeTab === "subnets" && ipVersion === "ipv4" && (
                <SubnetSplitter results={results} onCopy={copyToClipboard} copiedField={copiedField} />
              )}
            </>
          )}

          {/* Footer */}
          <div className="text-xs text-slate-500 pt-4 border-t border-slate-700">
            Full Features: IPv4 calculations, IPv6 support, Copy to Clipboard, Subnet Splitter.
          </div>
        </div>
      </Card>
    </div>
  )
}

// IPv4 Subnet Calculation
function calculateIPv4Subnet(ip: string, prefix: number) {
  const parts = ip.split(".").map(Number)
  if (parts.length !== 4 || parts.some((p) => p < 0 || p > 255)) {
    throw new Error("Invalid IPv4 address")
  }

  if (prefix < 0 || prefix > 32) {
    throw new Error("Invalid prefix length")
  }

  const ipNum = (parts[0] << 24) + (parts[1] << 16) + (parts[2] << 8) + parts[3]
  const mask = 0xffffffff << (32 - prefix)
  const network = ipNum & mask
  const broadcast = network | ~mask
  const firstHost = network + 1
  const lastHost = broadcast - 1
  const hostCount = Math.pow(2, 32 - prefix) - 2

  return {
    networkAddress: numToIP(network),
    broadcastAddress: numToIP(broadcast),
    firstHostAddress: numToIP(firstHost),
    lastHostAddress: numToIP(lastHost),
    netmask: numToIP(mask),
    wildcardMask: numToIP(~mask),
    cidr: prefix,
    hostCount: hostCount,
    totalAddresses: Math.pow(2, 32 - prefix),
    ipNum: network,
    mask: mask,
  }
}

// IPv6 Subnet Calculation (basic)
function calculateIPv6Subnet(ip: string, prefix: number) {
  if (prefix < 0 || prefix > 128) {
    throw new Error("Invalid prefix length")
  }

  const totalAddresses = Math.pow(2, 128 - prefix)

  return {
    ipAddress: ip,
    cidr: prefix,
    prefixLength: prefix,
    totalAddresses: totalAddresses,
    addressCount: `2^${128 - prefix}`,
    networkPrefix: ip.split("/")[0],
  }
}

function numToIP(num: number) {
  return [(num >>> 24) & 0xff, (num >>> 16) & 0xff, (num >>> 8) & 0xff, num & 0xff].join(".")
}
