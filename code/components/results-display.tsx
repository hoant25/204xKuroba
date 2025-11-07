"use client"

import { Copy, Check } from "lucide-react"

interface ResultsDisplayProps {
  results: any
  ipVersion: "ipv4" | "ipv6"
  onCopy: (text: string, fieldName: string) => void
  copiedField: string | null
}

export default function ResultsDisplay({ results, ipVersion, onCopy, copiedField }: ResultsDisplayProps) {
  if (ipVersion === "ipv6") {
    return (
      <div className="space-y-4 p-4 bg-slate-700 border border-slate-600 rounded-lg">
        <div className="grid grid-cols-2 gap-4">
          <ResultField
            label="IP Address"
            value={results.ipAddress}
            fieldName="ipAddress"
            onCopy={onCopy}
            copied={copiedField === "ipAddress"}
          />
          <ResultField
            label="CIDR"
            value={`/${results.cidr}`}
            fieldName="cidr"
            onCopy={onCopy}
            copied={copiedField === "cidr"}
          />
          <div className="col-span-2">
            <ResultField
              label="Total Addresses"
              value={results.addressCount}
              fieldName="totalAddresses"
              onCopy={onCopy}
              copied={copiedField === "totalAddresses"}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 p-4 bg-slate-700 border border-slate-600 rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ResultField
          label="Network Address"
          value={results.networkAddress}
          fieldName="networkAddress"
          onCopy={onCopy}
          copied={copiedField === "networkAddress"}
        />
        <ResultField
          label="Netmask"
          value={results.netmask}
          fieldName="netmask"
          onCopy={onCopy}
          copied={copiedField === "netmask"}
        />
        <ResultField
          label="Broadcast Address"
          value={results.broadcastAddress}
          fieldName="broadcastAddress"
          onCopy={onCopy}
          copied={copiedField === "broadcastAddress"}
        />
        <ResultField
          label="CIDR"
          value={`/${results.cidr}`}
          fieldName="cidr"
          onCopy={onCopy}
          copied={copiedField === "cidr"}
        />
        <ResultField
          label="First Host"
          value={results.firstHostAddress}
          fieldName="firstHostAddress"
          onCopy={onCopy}
          copied={copiedField === "firstHostAddress"}
        />
        <ResultField
          label="Last Host"
          value={results.lastHostAddress}
          fieldName="lastHostAddress"
          onCopy={onCopy}
          copied={copiedField === "lastHostAddress"}
        />
        <ResultField
          label="Wildcard Mask"
          value={results.wildcardMask}
          fieldName="wildcardMask"
          onCopy={onCopy}
          copied={copiedField === "wildcardMask"}
        />
        <div className="col-span-1 md:col-span-2">
          <ResultField
            label="Usable Hosts"
            value={results.hostCount.toString()}
            fieldName="hostCount"
            onCopy={onCopy}
            copied={copiedField === "hostCount"}
          />
        </div>
      </div>
    </div>
  )
}

function ResultField({ label, value, fieldName, onCopy, copied }: any) {
  return (
    <div>
      <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">{label}</p>
      <div className="flex items-center gap-2 bg-slate-600 rounded p-2 group">
        <p className="text-sm font-mono text-green-400 flex-1 break-all">{value}</p>
        <button
          onClick={() => onCopy(value, fieldName)}
          className="text-slate-400 hover:text-slate-300 transition opacity-0 group-hover:opacity-100"
          title="Copy to clipboard"
        >
          {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
    </div>
  )
}
