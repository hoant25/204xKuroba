"use client"

import React from "react"
import { Download } from "lucide-react"
import * as XLSX from "xlsx"
import { useState } from "react"
import { ChevronDown, ChevronUp, Copy } from "lucide-react"
import WarningModal from "./warning-modal"

interface SubnetNode {
  id: string
  network: string
  prefix: number
  children?: SubnetNode[]
  expanded?: boolean
}

interface WarningState {
  isOpen: boolean
  title: string
  message: string
}

export default function VisualSubnetCalculator() {
  const [ipVersion, setIpVersion] = useState<"ipv4" | "ipv6">("ipv4")
  const [networkAddress, setNetworkAddress] = useState("192.168.0.0")
  const [maskBits, setMaskBits] = useState("16")
  const [targetPrefix, setTargetPrefix] = useState("24")
  const [subnets, setSubnets] = useState<SubnetNode[]>([])
  const [warning, setWarning] = useState<WarningState>({
    isOpen: false,
    title: "",
    message: "",
  })
  const [columns, setColumns] = useState({
    address: true,
    netmask: false,
    range: true,
    useable: true,
    hosts: true,
    divide: true,
    join: true,
  })

  const ipv6ToBytes = (ip: string): number[] => {
    const parts = ip.split(":")
    const bytes: number[] = []

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i] || "0"
      const value = part ? Number.parseInt(part, 16) : 0
      bytes.push((value >> 8) & 0xff, value & 0xff)
    }

    while (bytes.length < 16) {
      bytes.push(0)
    }

    return bytes
  }

  const bytesToIPv6 = (bytes: number[]): string => {
    const parts: string[] = []
    for (let i = 0; i < 16; i += 2) {
      const value = (bytes[i] << 8) | bytes[i + 1]
      parts.push(value.toString(16))
    }
    return parts.join(":")
  }

  const calculateIPv4Subnet = (ip: string, prefix: number) => {
    const parts = ip.split(".").map(Number)
    if (parts.length !== 4 || parts.some((p) => p < 0 || p > 255)) {
      throw new Error("Invalid IPv4")
    }
    if (prefix < 0 || prefix > 32) {
      throw new Error("Invalid prefix")
    }

    const ipNum = (parts[0] << 24) + (parts[1] << 16) + (parts[2] << 8) + parts[3]
    const mask = 0xffffffff << (32 - prefix)
    const network = ipNum & mask
    const broadcast = network | ~mask

    return { network, broadcast, mask }
  }

  const numToIPv4 = (num: number) => {
    return [(num >>> 24) & 0xff, (num >>> 16) & 0xff, (num >>> 8) & 0xff, num & 0xff].join(".")
  }

  const validateNetworkBoundary = (ip: string, prefix: number): { valid: boolean; correctedIP?: string } => {
    try {
      if (ipVersion === "ipv4") {
        const { network } = calculateIPv4Subnet(ip, prefix)
        const correctedIP = numToIPv4(network)

        if (correctedIP !== ip) {
          return { valid: false, correctedIP }
        }
        return { valid: true }
      } else {
        // IPv6 basic validation
        return { valid: true }
      }
    } catch (error) {
      return { valid: false }
    }
  }

  const handleUpdate = () => {
    if (!networkAddress.trim() || !maskBits.trim()) return

    try {
      const prefix = Number.parseInt(maskBits)
      const target = targetPrefix ? Number.parseInt(targetPrefix) : prefix
      const maxPrefix = ipVersion === "ipv4" ? 32 : 128

      if (target < prefix) {
        setWarning({
          isOpen: true,
          title: "Error",
          message: "Target prefix must be greater than or equal to current prefix.",
        })
        return
      }

      if (prefix > maxPrefix || target > maxPrefix) {
        setWarning({
          isOpen: true,
          title: "Error",
          message: `${ipVersion === "ipv4" ? "IPv4" : "IPv6"} prefix must be between 0 and ${maxPrefix}.`,
        })
        return
      }

      const validation = validateNetworkBoundary(networkAddress, prefix)
      if (!validation.valid) {
        if (validation.correctedIP) {
          setWarning({
            isOpen: true,
            title: "204xKuroba says",
            message: `The network address entered is not on a network boundary for this mask.\nIt has been changed to ${validation.correctedIP}.`,
          })
          setNetworkAddress(validation.correctedIP)
          return
        }
      }

      if (ipVersion === "ipv4") {
        const { network } = calculateIPv4Subnet(networkAddress, prefix)
        const initialSubnet: SubnetNode = {
          id: `subnet-${Date.now()}`,
          network: numToIPv4(network),
          prefix: prefix,
          children: [],
          expanded: true,
        }

        if (target > prefix) {
          let tempSubnets = [initialSubnet]
          for (let i = prefix; i < target; i++) {
            tempSubnets = automaticallyDivideAllIPv4(tempSubnets)
          }
          setSubnets(tempSubnets)
        } else {
          setSubnets([initialSubnet])
        }
      } else {
        // IPv6 handling
        const initialSubnet: SubnetNode = {
          id: `subnet-${Date.now()}`,
          network: networkAddress,
          prefix: prefix,
          children: [],
          expanded: true,
        }

        if (target > prefix) {
          let tempSubnets = [initialSubnet]
          for (let i = prefix; i < target; i++) {
            tempSubnets = automaticallyDivideAllIPv6(tempSubnets)
          }
          setSubnets(tempSubnets)
        } else {
          setSubnets([initialSubnet])
        }
      }
    } catch (error) {
      setWarning({
        isOpen: true,
        title: "Error",
        message: "Invalid network address or prefix.",
      })
    }
  }

  const automaticallyDivideAllIPv4 = (nodes: SubnetNode[]): SubnetNode[] => {
    return nodes.flatMap((node) => {
      if (node.children && node.children.length > 0) {
        return [{ ...node, children: automaticallyDivideAllIPv4(node.children) }]
      }

      if (node.prefix < 31) {
        const { network } = calculateIPv4Subnet(node.network, node.prefix)
        const subnetSize = Math.pow(2, 32 - node.prefix) / 2
        const firstNet = network
        const secondNet = network + subnetSize

        return [
          {
            id: `subnet-${firstNet}-${node.prefix + 1}`,
            network: numToIPv4(firstNet),
            prefix: node.prefix + 1,
            children: [],
            expanded: true,
          },
          {
            id: `subnet-${secondNet}-${node.prefix + 1}`,
            network: numToIPv4(secondNet),
            prefix: node.prefix + 1,
            children: [],
            expanded: true,
          },
        ]
      }

      return [node]
    })
  }

  const automaticallyDivideAllIPv6 = (nodes: SubnetNode[]): SubnetNode[] => {
    return nodes.flatMap((node) => {
      if (node.children && node.children.length > 0) {
        return [{ ...node, children: automaticallyDivideAllIPv6(node.children) }]
      }

      if (node.prefix < 127) {
        const bytes = ipv6ToBytes(node.network)
        const bitIndex = node.prefix
        const byteIndex = Math.floor(bitIndex / 8)
        const bitOffset = bitIndex % 8

        const firstBytes = [...bytes]
        const secondBytes = [...bytes]
        secondBytes[byteIndex] |= 1 << (7 - bitOffset)

        return [
          {
            id: `subnet-${node.network}-${node.prefix + 1}`,
            network: bytesToIPv6(firstBytes),
            prefix: node.prefix + 1,
            children: [],
            expanded: true,
          },
          {
            id: `subnet-${node.network}-split-${node.prefix + 1}`,
            network: bytesToIPv6(secondBytes),
            prefix: node.prefix + 1,
            children: [],
            expanded: true,
          },
        ]
      }

      return [node]
    })
  }

  const handleReset = () => {
    setNetworkAddress(ipVersion === "ipv4" ? "192.168.0.0" : "2001:db8::")
    setMaskBits(ipVersion === "ipv4" ? "16" : "32")
    setTargetPrefix(ipVersion === "ipv4" ? "24" : "48")
    setSubnets([])
  }

  const handleDivide = (nodeId: string, parent: SubnetNode[]): SubnetNode[] => {
    return parent.map((node) => {
      const maxPrefix = ipVersion === "ipv4" ? 32 : 128
      if (node.id === nodeId && node.prefix < maxPrefix) {
        const newChildren: SubnetNode[] = ipVersion === "ipv4" ? divideIPv4Node(node) : divideIPv6Node(node)

        return { ...node, children: newChildren }
      }

      if (node.children) {
        return { ...node, children: handleDivide(nodeId, node.children) }
      }

      return node
    })
  }

  const divideIPv4Node = (node: SubnetNode): SubnetNode[] => {
    const { network } = calculateIPv4Subnet(node.network, node.prefix)
    const subnetSize = Math.pow(2, 32 - node.prefix) / 2
    const firstNet = network
    const secondNet = network + subnetSize

    return [
      {
        id: `subnet-${firstNet}-${node.prefix + 1}`,
        network: numToIPv4(firstNet),
        prefix: node.prefix + 1,
        children: [],
        expanded: true,
      },
      {
        id: `subnet-${secondNet}-${node.prefix + 1}`,
        network: numToIPv4(secondNet),
        prefix: node.prefix + 1,
        children: [],
        expanded: true,
      },
    ]
  }

  const divideIPv6Node = (node: SubnetNode): SubnetNode[] => {
    const bytes = ipv6ToBytes(node.network)
    const bitIndex = node.prefix
    const byteIndex = Math.floor(bitIndex / 8)
    const bitOffset = bitIndex % 8

    const firstBytes = [...bytes]
    const secondBytes = [...bytes]
    secondBytes[byteIndex] |= 1 << (7 - bitOffset)

    return [
      {
        id: `subnet-${node.network}-${node.prefix + 1}`,
        network: bytesToIPv6(firstBytes),
        prefix: node.prefix + 1,
        children: [],
        expanded: true,
      },
      {
        id: `subnet-${node.network}-split-${node.prefix + 1}`,
        network: bytesToIPv6(secondBytes),
        prefix: node.prefix + 1,
        children: [],
        expanded: true,
      },
    ]
  }

  const handleJoin = (nodeId: string, parent: SubnetNode[]): SubnetNode[] => {
    return parent
      .map((node) => {
        if (node.id === nodeId && node.children && node.children.length > 0) {
          return { ...node, children: [] }
        }

        if (node.children) {
          return { ...node, children: handleJoin(nodeId, node.children) }
        }

        return node
      })
      .filter((node) => node.id !== nodeId)
  }

  const toggleColumn = (col: keyof typeof columns) => {
    setColumns((prev) => ({ ...prev, [col]: !prev[col] }))
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const getIPv4Range = (node: SubnetNode) => {
    const { network, broadcast } = calculateIPv4Subnet(node.network, node.prefix)
    const firstHost = network + 1
    const lastHost = broadcast - 1
    const hostCount = Math.pow(2, 32 - node.prefix) - 2

    return {
      networkIP: numToIPv4(network),
      broadcastIP: numToIPv4(broadcast),
      firstHost: numToIPv4(firstHost),
      lastHost: numToIPv4(lastHost),
      hostCount: Math.max(0, hostCount),
      netmask: numToIPv4((0xffffffff << (32 - node.prefix)) >>> 0),
    }
  }

  const renderSubnetRow = (node: SubnetNode, depth = 0) => {
    let rangeInfo: any = {}

    if (ipVersion === "ipv4") {
      rangeInfo = getIPv4Range(node)
    }

    const rows = [
      <tr key={node.id} className="border-b border-slate-700 hover:bg-slate-800 transition">
        <td className="px-4 py-3 border-r border-slate-700" style={{ paddingLeft: `${depth * 20 + 16}px` }}>
          {node.prefix < (ipVersion === "ipv4" ? 32 : 128) && node.children && node.children.length > 0 && (
            <button
              onClick={() =>
                setSubnets((prev) =>
                  prev.map((s) => ({
                    ...s,
                    children: toggleExpanded(s.children, node.id),
                  })),
                )
              }
              className="mr-2 inline-block text-slate-400 hover:text-green-400"
            >
              {node.expanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </button>
          )}
          {columns.address && (
            <button
              onClick={() => copyToClipboard(`${node.network}/${node.prefix}`)}
              className="font-mono text-sm text-slate-300 hover:text-green-400 transition inline-flex items-center gap-1"
            >
              {node.network}/{node.prefix}
              <Copy size={14} className="opacity-0 group-hover:opacity-100" />
            </button>
          )}
        </td>

        {columns.netmask && (
          <td className="px-4 py-3 border-r border-slate-700 text-sm font-mono text-slate-300">
            {ipVersion === "ipv4" ? rangeInfo.netmask : "N/A"}
          </td>
        )}

        {columns.range && (
          <td className="px-4 py-3 border-r border-slate-700 text-sm font-mono text-slate-300">
            {ipVersion === "ipv4" ? `${rangeInfo.networkIP} - ${rangeInfo.broadcastIP}` : "N/A"}
          </td>
        )}

        {columns.useable && (
          <td className="px-4 py-3 border-r border-slate-700 text-sm font-mono text-slate-300">
            {ipVersion === "ipv4" ? `${rangeInfo.firstHost} - ${rangeInfo.lastHost}` : "N/A"}
          </td>
        )}

        {columns.hosts && (
          <td className="px-4 py-3 border-r border-slate-700 text-sm font-mono text-slate-300 font-medium">
            {ipVersion === "ipv4" ? rangeInfo.hostCount : Math.pow(2, 128 - node.prefix)}
          </td>
        )}

        {columns.divide && (
          <td className="px-4 py-3 border-r border-slate-700">
            {node.prefix < (ipVersion === "ipv4" ? 31 : 127) && (
              <button
                onClick={() => setSubnets(handleDivide(node.id, subnets))}
                className="px-3 py-1.5 text-sm bg-green-600 text-white hover:bg-green-700 border border-green-700 rounded font-medium transition shadow-sm hover:shadow"
              >
                Divide
              </button>
            )}
          </td>
        )}

        {columns.join && (
          <td className="px-4 py-3">
            {node.children && node.children.length > 0 && (
              <button
                onClick={() => setSubnets(handleJoin(node.id, subnets))}
                className="px-3 py-1.5 text-sm bg-green-600 text-white hover:bg-green-700 border border-green-700 rounded font-medium transition shadow-sm hover:shadow"
              >
                Join
              </button>
            )}
          </td>
        )}
      </tr>,
    ]

    if (node.expanded && node.children) {
      node.children.forEach((child) => {
        rows.push(...renderSubnetRow(child, depth + 1))
      })
    }

    return rows
  }

  const toggleExpanded = (nodes: SubnetNode[] | undefined, targetId: string): SubnetNode[] | undefined => {
    return nodes?.map((n) => (n.id === targetId ? { ...n, expanded: !n.expanded } : n))
  }

  const exportToExcel = () => {
    if (subnets.length === 0) return

    const flattenedData: any[] = []

    const flattenSubnets = (nodes: SubnetNode[]) => {
      nodes.forEach((node) => {
        let rangeInfo: any = {}

        if (ipVersion === "ipv4") {
          rangeInfo = getIPv4Range(node)
        }

        const row: any = {}

        if (columns.address) row["Subnet Address"] = `${node.network}/${node.prefix}`
        if (columns.netmask) row["Netmask"] = ipVersion === "ipv4" ? rangeInfo.netmask : "N/A"
        if (columns.range)
          row["Range of Addresses"] = ipVersion === "ipv4" ? `${rangeInfo.networkIP} - ${rangeInfo.broadcastIP}` : "N/A"
        if (columns.useable)
          row["Useable IPs"] = ipVersion === "ipv4" ? `${rangeInfo.firstHost} - ${rangeInfo.lastHost}` : "N/A"
        if (columns.hosts) row["Hosts"] = ipVersion === "ipv4" ? rangeInfo.hostCount : Math.pow(2, 128 - node.prefix)

        flattenedData.push(row)

        if (node.children && node.children.length > 0) {
          flattenSubnets(node.children)
        }
      })
    }

    flattenSubnets(subnets)

    const worksheet = XLSX.utils.json_to_sheet(flattenedData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Subnets")

    const colWidths = [25, 20, 35, 35, 15]
    worksheet["!cols"] = colWidths.map((w) => ({ wch: w }))

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
    const filename = `204xKuroba-subnets-${timestamp}.xlsx`

    const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
    const blob = new Blob([wbout], { type: "application/octet-stream" })

    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    link.click()

    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <WarningModal
        isOpen={warning.isOpen}
        title={warning.title}
        message={warning.message}
        onClose={() => setWarning({ ...warning, isOpen: false })}
      />

      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-white">204xKuroba - Subnet Calculator</h1>
        <p className="text-slate-400">Enter the network you wish to subnet:</p>
      </div>

      <div className="space-y-4">
        <div className="flex gap-4 items-center">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={ipVersion === "ipv4"}
              onChange={() => {
                setIpVersion("ipv4")
                setNetworkAddress("192.168.0.0")
                setMaskBits("16")
                setTargetPrefix("24")
                setSubnets([])
              }}
              className="w-4 h-4 accent-green-500"
            />
            <span className="text-white font-medium">IPv4</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={ipVersion === "ipv6"}
              onChange={() => {
                setIpVersion("ipv6")
                setNetworkAddress("2001:db8::")
                setMaskBits("32")
                setTargetPrefix("48")
                setSubnets([])
              }}
              className="w-4 h-4 accent-green-500"
            />
            <span className="text-white font-medium">IPv6</span>
          </label>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-slate-300 mb-2">Network Address</label>
            <input
              type="text"
              value={networkAddress}
              onChange={(e) => setNetworkAddress(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-600 bg-slate-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
              placeholder={ipVersion === "ipv4" ? "192.168.0.0" : "2001:db8::"}
            />
          </div>

          <div className="flex-1">
            <label className="block text-sm font-semibold text-slate-300 mb-2">Mask Bits</label>
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">/</span>
              <input
                type="number"
                value={maskBits}
                onChange={(e) => setMaskBits(e.target.value)}
                className="flex-1 px-4 py-2.5 border border-slate-600 bg-slate-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                min="0"
                max={ipVersion === "ipv4" ? "32" : "128"}
              />
            </div>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-semibold text-slate-300 mb-2">Target Prefix</label>
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">/</span>
              <input
                type="number"
                value={targetPrefix}
                onChange={(e) => setTargetPrefix(e.target.value)}
                className="flex-1 px-4 py-2.5 border border-slate-600 bg-slate-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                min="0"
                max={ipVersion === "ipv4" ? "32" : "128"}
                placeholder={ipVersion === "ipv4" ? "24" : "48"}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleUpdate}
              className="px-6 py-2.5 bg-green-600 text-white border border-green-700 rounded-lg hover:bg-green-700 font-semibold transition shadow-sm hover:shadow"
            >
              Update
            </button>
            <button
              onClick={handleReset}
              className="px-6 py-2.5 bg-slate-700 text-white border border-slate-600 rounded-lg hover:bg-slate-600 font-semibold transition shadow-sm hover:shadow"
            >
              Reset
            </button>
            <button
              onClick={exportToExcel}
              disabled={subnets.length === 0}
              className="px-6 py-2.5 bg-blue-600 text-white border border-blue-700 rounded-lg hover:bg-blue-700 font-semibold transition shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Download size={16} />
              Export
            </button>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 space-y-3">
        <p className="text-sm font-semibold text-slate-300">Show columns:</p>
        <div className="flex flex-wrap gap-4">
          {Object.entries(columns).map(([key, value]) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer hover:text-green-400 transition">
              <input
                type="checkbox"
                checked={value}
                onChange={() => toggleColumn(key as keyof typeof columns)}
                className="w-4 h-4 accent-green-500 cursor-pointer"
              />
              <span className="text-sm text-slate-300 font-medium">
                {key === "address" && "Subnet address"}
                {key === "netmask" && "Netmask"}
                {key === "range" && "Range of addresses"}
                {key === "useable" && "Useable IPs"}
                {key === "hosts" && "Hosts"}
                {key === "divide" && "Divide"}
                {key === "join" && "Join"}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2 text-sm text-slate-400">
        <p>Click below to split and join subnets.</p>
        <p>
          If you wish to save this subnetting for later, bookmark{" "}
          <span className="text-green-400 cursor-pointer hover:underline">this hyperlink</span>.
        </p>
      </div>

      <hr className="border-slate-700" />

      {subnets.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-slate-700 shadow-lg">
          <table className="w-full border-collapse bg-slate-900">
            <thead>
              <tr className="bg-slate-800 border-b border-slate-700">
                {columns.address && (
                  <th className="px-4 py-3 text-left text-sm font-semibold text-white border-r border-slate-700">
                    Subnet address
                  </th>
                )}
                {columns.netmask && (
                  <th className="px-4 py-3 text-left text-sm font-semibold text-white border-r border-slate-700">
                    Netmask
                  </th>
                )}
                {columns.range && (
                  <th className="px-4 py-3 text-left text-sm font-semibold text-white border-r border-slate-700">
                    Range of addresses
                  </th>
                )}
                {columns.useable && (
                  <th className="px-4 py-3 text-left text-sm font-semibold text-white border-r border-slate-700">
                    Useable IPs
                  </th>
                )}
                {columns.hosts && (
                  <th className="px-4 py-3 text-left text-sm font-semibold text-white border-r border-slate-700">
                    Hosts
                  </th>
                )}
                {columns.divide && (
                  <th className="px-4 py-3 text-left text-sm font-semibold text-white border-r border-slate-700">
                    Divide
                  </th>
                )}
                {columns.join && <th className="px-4 py-3 text-left text-sm font-semibold text-white">Join</th>}
              </tr>
            </thead>
            <tbody>
              {subnets.map((subnet) =>
                renderSubnetRow(subnet).map((row) => {
                  return React.cloneElement(row, {
                    ...row.props,
                    className: "border-b border-slate-700 hover:bg-slate-800 transition",
                  })
                }),
              )}
            </tbody>
          </table>
        </div>
      )}

      {subnets.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <p className="text-lg">Enter a network address and mask bits, then click Update to begin.</p>
        </div>
      )}
    </div>
  )
}
