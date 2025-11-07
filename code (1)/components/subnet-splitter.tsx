"use client"

import { useState } from "react"
import { Copy, Check, ChevronDown, ChevronRight } from "lucide-react"

interface SubnetNode {
  id: string
  networkAddress: string
  cidr: number
  ipNum: number
  broadcastNum: number
  expanded: boolean
  children: SubnetNode[]
}

interface SubnetSplitterProps {
  results: any
  onCopy: (text: string, fieldName: string) => void
  copiedField: string | null
}

export default function SubnetSplitter({ results, onCopy, copiedField }: SubnetSplitterProps) {
  const [rootNode, setRootNode] = useState<SubnetNode | null>(() => {
    return {
      id: "root",
      networkAddress: results.networkAddress,
      cidr: results.cidr,
      ipNum: results.ipNum,
      broadcastNum: results.ipNum + (Math.pow(2, 32 - results.cidr) - 1),
      expanded: true,
      children: [],
    }
  })

  const splitSubnet = (nodeId: string, node: SubnetNode | null = rootNode): SubnetNode | null => {
    if (!node) return null

    if (node.id === nodeId) {
      if (node.cidr >= 31) {
        alert("Cannot split further - maximum prefix length reached")
        return node
      }

      const newPrefix = node.cidr + 1
      const subnetSize = Math.pow(2, 32 - newPrefix)

      const child1 = {
        id: `${nodeId}-1`,
        networkAddress: numToIP(node.ipNum),
        cidr: newPrefix,
        ipNum: node.ipNum,
        broadcastNum: node.ipNum + subnetSize - 1,
        expanded: false,
        children: [],
      }

      const child2 = {
        id: `${nodeId}-2`,
        networkAddress: numToIP(node.ipNum + subnetSize),
        cidr: newPrefix,
        ipNum: node.ipNum + subnetSize,
        broadcastNum: node.broadcastNum,
        expanded: false,
        children: [],
      }

      return { ...node, expanded: true, children: [child1, child2] }
    }

    return {
      ...node,
      children: node.children.map((child) => splitSubnet(nodeId, child) || child),
    }
  }

  const toggleExpand = (nodeId: string, node: SubnetNode | null = rootNode): SubnetNode | null => {
    if (!node) return null

    if (node.id === nodeId) {
      return { ...node, expanded: !node.expanded }
    }

    return {
      ...node,
      children: node.children.map((child) => toggleExpand(nodeId, child) || child),
    }
  }

  const handleSplitClick = (nodeId: string) => {
    setRootNode((prev) => splitSubnet(nodeId, prev))
  }

  const handleToggleExpand = (nodeId: string) => {
    setRootNode((prev) => toggleExpand(nodeId, prev))
  }

  const getSubnetInfo = (node: SubnetNode) => {
    const size = Math.pow(2, 32 - node.cidr)
    const broadcastAddress = numToIP(node.broadcastNum)
    const firstHost = numToIP(node.ipNum + 1)
    const lastHost = numToIP(node.broadcastNum - 1)
    const usableHosts = size - 2

    return { broadcastAddress, firstHost, lastHost, usableHosts, totalAddresses: size }
  }

  return (
    <div className="space-y-4 p-4 bg-slate-700 border border-slate-600 rounded-lg">
      <p className="text-xs text-slate-400 uppercase tracking-wider">Nhập vào bên dưới để chia và ghép các mạng con</p>

      {rootNode && (
        <div className="space-y-2">
          <SubnetTreeNode
            node={rootNode}
            onSplit={handleSplitClick}
            onToggleExpand={handleToggleExpand}
            onCopy={onCopy}
            copiedField={copiedField}
            getSubnetInfo={getSubnetInfo}
            numToIP={numToIP}
            depth={0}
          />
        </div>
      )}
    </div>
  )
}

interface SubnetTreeNodeProps {
  node: SubnetNode
  onSplit: (nodeId: string) => void
  onToggleExpand: (nodeId: string) => void
  onCopy: (text: string, fieldName: string) => void
  copiedField: string | null
  getSubnetInfo: (node: SubnetNode) => any
  numToIP: (num: number) => string
  depth: number
}

function SubnetTreeNode({
  node,
  onSplit,
  onToggleExpand,
  onCopy,
  copiedField,
  getSubnetInfo,
  numToIP,
  depth,
}: SubnetTreeNodeProps) {
  const info = getSubnetInfo(node)
  const hasChildren = node.children.length > 0

  return (
    <div className="space-y-2">
      <div className={`bg-slate-600 border border-slate-500 rounded p-3 space-y-3 ml-${depth * 4}`}>
        {/* Header with expand button */}
        <div className="flex items-start gap-2">
          {hasChildren && (
            <button
              onClick={() => onToggleExpand(node.id)}
              className="text-slate-400 hover:text-slate-300 transition mt-0.5"
              title={node.expanded ? "Collapse" : "Expand"}
            >
              {node.expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          )}
          {!hasChildren && <div className="w-4" />}

          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-200">
              {node.networkAddress}/{node.cidr}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onSplit(node.id)}
              disabled={node.cidr >= 31}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-500 disabled:cursor-not-allowed text-white text-xs rounded font-medium transition"
              title="Split this subnet in half"
            >
              Chia
            </button>
          </div>
        </div>

        {/* Subnet details grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
          <SubnetField
            label="Địa chỉ mạng"
            value={node.networkAddress}
            fieldName={`${node.id}-network`}
            onCopy={onCopy}
            copied={copiedField === `${node.id}-network`}
          />
          <SubnetField
            label="Broadcast"
            value={info.broadcastAddress}
            fieldName={`${node.id}-broadcast`}
            onCopy={onCopy}
            copied={copiedField === `${node.id}-broadcast`}
          />
          <SubnetField
            label="First Host"
            value={info.firstHost}
            fieldName={`${node.id}-first`}
            onCopy={onCopy}
            copied={copiedField === `${node.id}-first`}
          />
          <SubnetField
            label="Last Host"
            value={info.lastHost}
            fieldName={`${node.id}-last`}
            onCopy={onCopy}
            copied={copiedField === `${node.id}-last`}
          />
          <SubnetField
            label="Usable Hosts"
            value={info.usableHosts.toString()}
            fieldName={`${node.id}-usable`}
            onCopy={onCopy}
            copied={copiedField === `${node.id}-usable`}
          />
          <SubnetField
            label="Total Addresses"
            value={info.totalAddresses.toString()}
            fieldName={`${node.id}-total`}
            onCopy={onCopy}
            copied={copiedField === `${node.id}-total`}
          />
        </div>
      </div>

      {node.expanded && hasChildren && (
        <div className="space-y-2 ml-4">
          {node.children.map((child) => (
            <SubnetTreeNode
              key={child.id}
              node={child}
              onSplit={onSplit}
              onToggleExpand={onToggleExpand}
              onCopy={onCopy}
              copiedField={copiedField}
              getSubnetInfo={getSubnetInfo}
              numToIP={numToIP}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function SubnetField({ label, value, fieldName, onCopy, copied }: any) {
  return (
    <div className="space-y-1">
      <p className="text-slate-500 text-xs">{label}</p>
      <div className="flex items-center gap-1 bg-slate-700 rounded px-2 py-1 group">
        <p className="text-slate-300 font-mono text-xs flex-1 break-all">{value}</p>
        <button
          onClick={() => onCopy(value, fieldName)}
          className="text-slate-500 hover:text-slate-400 transition opacity-0 group-hover:opacity-100"
          title="Copy to clipboard"
        >
          {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
        </button>
      </div>
    </div>
  )
}

function numToIP(num: number) {
  return [(num >>> 24) & 0xff, (num >>> 16) & 0xff, (num >>> 8) & 0xff, num & 0xff].join(".")
}
