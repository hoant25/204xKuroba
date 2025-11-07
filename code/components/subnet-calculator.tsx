"use client"

import { useState } from "react"

interface SubnetResult {
  cidr: string
  ipRange: string
  usableIPs: string
  hostCount: number
  canSplit?: boolean
}

export default function SubnetCalculator() {
  const [networkAddress, setNetworkAddress] = useState("192.168.0.0")
  const [prefixLength, setPrefixLength] = useState("16")
  const [results, setResults] = useState<SubnetResult[]>([])
  const [showResults, setShowResults] = useState(false)

  const [columnVisibility, setColumnVisibility] = useState({
    networkAddress: true,
    netmask: false,
    ipRange: true,
    usableIPs: true,
    hostCount: true,
    split: true,
    merge: true,
  })

  const handleColumnToggle = (column: keyof typeof columnVisibility) => {
    setColumnVisibility((prev) => ({
      ...prev,
      [column]: !prev[column],
    }))
  }

  const calculateSubnet = () => {
    try {
      const result = calculateIPv4(networkAddress, Number.parseInt(prefixLength))
      setResults([result])
      setShowResults(true)
    } catch (error) {
      alert("Invalid IP address or prefix length")
    }
  }

  const resetForm = () => {
    setNetworkAddress("192.168.0.0")
    setPrefixLength("16")
    setResults([])
    setShowResults(false)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground">Máy tính mạng con trực quan</h1>
      </div>

      {/* Input Section */}
      <div className="bg-white border border-border rounded-lg p-6 space-y-4">
        <div>
          <p className="text-sm font-medium text-foreground mb-4">Nhập mạng bạn muốn chia thành mạng con:</p>

          <div className="flex gap-3 items-end flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-foreground mb-2">Địa chỉ mạng</label>
              <input
                type="text"
                value={networkAddress}
                onChange={(e) => setNetworkAddress(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded bg-input text-foreground"
                placeholder="192.168.0.0"
              />
            </div>

            <div className="flex-1 min-w-[150px]">
              <label className="block text-sm font-medium text-foreground mb-2">Mầu mặt nạ</label>
              <div className="flex gap-1">
                <span className="px-3 py-2 border border-border rounded bg-input text-foreground">/</span>
                <input
                  type="number"
                  value={prefixLength}
                  onChange={(e) => setPrefixLength(e.target.value)}
                  min="0"
                  max="32"
                  className="w-full px-3 py-2 border border-border rounded bg-input text-foreground"
                  placeholder="16"
                />
              </div>
            </div>

            <button
              onClick={calculateSubnet}
              className="px-6 py-2 bg-primary hover:bg-primary-hover text-white font-medium rounded transition-colors"
            >
              Cập nhật
            </button>

            <button
              onClick={resetForm}
              className="px-6 py-2 border border-border text-foreground hover:bg-input rounded transition-colors"
            >
              Đặt lại
            </button>
          </div>
        </div>
      </div>

      {/* Column Visibility */}
      {showResults && (
        <div className="bg-white border border-border rounded-lg p-4">
          <p className="text-sm font-medium text-foreground mb-3">Hiển thị các cột:</p>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={columnVisibility.networkAddress}
                onChange={() => handleColumnToggle("networkAddress")}
                className="w-4 h-4 cursor-pointer"
              />
              <span className="text-sm text-foreground">Địa chỉ mạng con</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={columnVisibility.netmask}
                onChange={() => handleColumnToggle("netmask")}
                className="w-4 h-4 cursor-pointer"
              />
              <span className="text-sm text-foreground">Mặt nạ mạng</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={columnVisibility.ipRange}
                onChange={() => handleColumnToggle("ipRange")}
                className="w-4 h-4 cursor-pointer"
              />
              <span className="text-sm text-foreground">Phạm vi địa chỉ</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={columnVisibility.usableIPs}
                onChange={() => handleColumnToggle("usableIPs")}
                className="w-4 h-4 cursor-pointer"
              />
              <span className="text-sm text-foreground">IP có thể sử dụng</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={columnVisibility.hostCount}
                onChange={() => handleColumnToggle("hostCount")}
                className="w-4 h-4 cursor-pointer"
              />
              <span className="text-sm text-foreground">Chủ nhân</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={columnVisibility.split}
                onChange={() => handleColumnToggle("split")}
                className="w-4 h-4 cursor-pointer"
              />
              <span className="text-sm text-foreground">Chia</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={columnVisibility.merge}
                onChange={() => handleColumnToggle("merge")}
                className="w-4 h-4 cursor-pointer"
              />
              <span className="text-sm text-foreground">Tham gia</span>
            </label>
          </div>
        </div>
      )}

      {/* Info Text */}
      {showResults && (
        <div className="text-sm text-secondary">
          Nhập vào bên dưới để chia và ghép các mạng con.
          <br />
          Nếu bạn muốn lại mạng con này để sử dụng sau, hãy đánh dấu{" "}
          <span className="font-semibold">siêu liên kết này</span>.
        </div>
      )}

      {/* Divider */}
      {showResults && <hr className="border-border" />}

      {/* Results Table */}
      {showResults && results.length > 0 && (
        <div className="overflow-x-auto border border-border rounded-lg">
          <table className="w-full">
            <thead>
              <tr className="bg-input border-b border-border">
                {columnVisibility.networkAddress && (
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Địa chỉ mạng con</th>
                )}
                {columnVisibility.netmask && (
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Mặt nạ mạng</th>
                )}
                {columnVisibility.ipRange && (
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Phạm vi địa chỉ</th>
                )}
                {columnVisibility.usableIPs && (
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground">IP có thể sử dụng</th>
                )}
                {columnVisibility.hostCount && (
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Chủ nhân</th>
                )}
                {columnVisibility.split && (
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Chia</th>
                )}
                {columnVisibility.merge && (
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Tham gia</th>
                )}
              </tr>
            </thead>
            <tbody>
              {results.map((result, idx) => (
                <tr key={idx} className="border-b border-border hover:bg-input transition-colors">
                  {columnVisibility.networkAddress && (
                    <td className="px-4 py-3 text-sm text-foreground">{result.cidr}</td>
                  )}
                  {columnVisibility.netmask && <td className="px-4 py-3 text-sm text-foreground">255.255.0.0</td>}
                  {columnVisibility.ipRange && <td className="px-4 py-3 text-sm text-foreground">{result.ipRange}</td>}
                  {columnVisibility.usableIPs && (
                    <td className="px-4 py-3 text-sm text-foreground">{result.usableIPs}</td>
                  )}
                  {columnVisibility.hostCount && (
                    <td className="px-4 py-3 text-sm text-foreground font-medium">{result.hostCount}</td>
                  )}
                  {columnVisibility.split && (
                    <td className="px-4 py-3 text-sm">
                      <button className="text-primary hover:text-primary-hover font-medium">Chia</button>
                    </td>
                  )}
                  {columnVisibility.merge && (
                    <td className="px-4 py-3 text-sm">
                      <button className="text-primary hover:underline">↔</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function calculateIPv4(ip: string, prefix: number) {
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
  const broadcast = network | (~mask >>> 0)
  const firstHost = network + 1
  const lastHost = broadcast - 1
  const hostCount = Math.pow(2, 32 - prefix) - 2

  const numToIP = (num: number) => {
    return [(num >>> 24) & 0xff, (num >>> 16) & 0xff, (num >>> 8) & 0xff, num & 0xff].join(".")
  }

  return {
    cidr: `${numToIP(network)}/${prefix}`,
    ipRange: `${numToIP(network)} - ${numToIP(broadcast)}`,
    usableIPs: `${numToIP(firstHost)} - ${numToIP(lastHost)}`,
    hostCount: hostCount,
  }
}
