<script lang="ts">
  import InfoTip from './InfoTip.svelte';
  let ipInput = $state("192.168.1.0");
  let cidr = $state(24);

  interface SubnetResult {
    networkAddress: string;
    broadcastAddress: string;
    firstHost: string;
    lastHost: string;
    totalHosts: number;
    subnetMask: string;
    wildcardMask: string;
    cidrNotation: string;
    ipClass: string;
    isPrivate: boolean;
    binaryIp: string;
    binaryMask: string;
  }

  function parseIp(s: string): number[] | null {
    const parts = s.trim().split(".");
    if (parts.length !== 4) return null;
    const nums = parts.map(Number);
    if (nums.some((n) => isNaN(n) || n < 0 || n > 255)) return null;
    return nums;
  }

  function ipToInt(octets: number[]): number {
    return ((octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3]) >>> 0;
  }

  function intToIp(n: number): string {
    return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join(".");
  }

  function intToBinary(n: number): string {
    return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255]
      .map((o) => o.toString(2).padStart(8, "0"))
      .join(".");
  }

  function getIpClass(firstOctet: number): string {
    if (firstOctet < 128) return "A";
    if (firstOctet < 192) return "B";
    if (firstOctet < 224) return "C";
    if (firstOctet < 240) return "D (Multicast)";
    return "E (Reserved)";
  }

  function isPrivateIp(octets: number[]): boolean {
    if (octets[0] === 10) return true;
    if (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) return true;
    if (octets[0] === 192 && octets[1] === 168) return true;
    return false;
  }

  let result = $derived.by((): SubnetResult | null => {
    const octets = parseIp(ipInput);
    if (!octets) return null;

    const ipInt = ipToInt(octets);
    const maskInt = cidr === 0 ? 0 : (~0 << (32 - cidr)) >>> 0;
    const wildcardInt = (~maskInt) >>> 0;
    const networkInt = (ipInt & maskInt) >>> 0;
    const broadcastInt = (networkInt | wildcardInt) >>> 0;

    const totalHosts = cidr >= 31 ? (cidr === 32 ? 1 : 2) : Math.pow(2, 32 - cidr) - 2;
    const firstHostInt = cidr >= 31 ? networkInt : (networkInt + 1) >>> 0;
    const lastHostInt = cidr >= 31 ? broadcastInt : (broadcastInt - 1) >>> 0;

    return {
      networkAddress: intToIp(networkInt),
      broadcastAddress: intToIp(broadcastInt),
      firstHost: intToIp(firstHostInt),
      lastHost: intToIp(lastHostInt),
      totalHosts,
      subnetMask: intToIp(maskInt),
      wildcardMask: intToIp(wildcardInt),
      cidrNotation: `/${cidr}`,
      ipClass: getIpClass(octets[0]),
      isPrivate: isPrivateIp(octets),
      binaryIp: intToBinary(ipInt),
      binaryMask: intToBinary(maskInt),
    };
  });

  const cheatsheet = [
    { cidr: "/32", mask: "255.255.255.255", hosts: 1 },
    { cidr: "/31", mask: "255.255.255.254", hosts: 2 },
    { cidr: "/30", mask: "255.255.255.252", hosts: 2 },
    { cidr: "/29", mask: "255.255.255.248", hosts: 6 },
    { cidr: "/28", mask: "255.255.255.240", hosts: 14 },
    { cidr: "/27", mask: "255.255.255.224", hosts: 30 },
    { cidr: "/26", mask: "255.255.255.192", hosts: 62 },
    { cidr: "/25", mask: "255.255.255.128", hosts: 126 },
    { cidr: "/24", mask: "255.255.255.0", hosts: 254 },
    { cidr: "/23", mask: "255.255.254.0", hosts: 510 },
    { cidr: "/22", mask: "255.255.252.0", hosts: 1022 },
    { cidr: "/21", mask: "255.255.248.0", hosts: 2046 },
    { cidr: "/20", mask: "255.255.240.0", hosts: 4094 },
    { cidr: "/16", mask: "255.255.0.0", hosts: 65534 },
    { cidr: "/8", mask: "255.0.0.0", hosts: 16777214 },
  ];
</script>

<div class="px-6 sm:px-8 py-6 space-y-6" style="max-width: 48rem; margin: 0 auto;">
  <!-- Input -->
  <div class="card">
    <div class="card-header">
      <span class="card-title">Input</span>
    </div>
    <div class="card-body">
      <div style="display: flex; gap: 12px; align-items: end; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 160px;">
          <label style="font-size: 11px; color: var(--color-text-muted); display: block; margin-bottom: 6px;">IP Address</label>
          <input type="text" bind:value={ipInput} placeholder="192.168.1.0" style="width: 100%;" />
        </div>
        <div style="width: 100px;">
          <label style="font-size: 11px; color: var(--color-text-muted); display: block; margin-bottom: 6px;">CIDR (/{cidr}) <InfoTip text="Classless Inter-Domain Routing -- a compact notation for IP ranges. /24 = 256 addresses, /16 = 65,536 addresses." /></label>
          <input type="range" min="0" max="32" bind:value={cidr} style="width: 100%; accent-color: var(--color-accent);" />
        </div>
        <div style="width: 60px;">
          <input type="number" min="0" max="32" bind:value={cidr} style="width: 100%; text-align: center;" />
        </div>
      </div>
    </div>
  </div>

  {#if result}
    <!-- Results -->
    <div class="metrics-grid cols-2">
      <div class="metric">
        <div class="metric-label">Network Address <InfoTip text="The first address in the subnet. It identifies the network itself and cannot be assigned to a host." /></div>
        <div class="metric-value" style="font-size: 16px; font-family: monospace;">{result.networkAddress}</div>
      </div>
      <div class="metric">
        <div class="metric-label">Broadcast Address <InfoTip text="The last address in the subnet. Packets sent here are delivered to all hosts on the network." /></div>
        <div class="metric-value" style="font-size: 16px; font-family: monospace;">{result.broadcastAddress}</div>
      </div>
      <div class="metric">
        <div class="metric-label">First Host</div>
        <div class="metric-value" style="font-size: 16px; font-family: monospace;">{result.firstHost}</div>
      </div>
      <div class="metric">
        <div class="metric-label">Last Host</div>
        <div class="metric-value" style="font-size: 16px; font-family: monospace;">{result.lastHost}</div>
      </div>
      <div class="metric">
        <div class="metric-label">Total Hosts</div>
        <div class="metric-value" style="font-size: 16px;">{result.totalHosts.toLocaleString()}</div>
      </div>
      <div class="metric">
        <div class="metric-label">Subnet Mask</div>
        <div class="metric-value" style="font-size: 16px; font-family: monospace;">{result.subnetMask}</div>
      </div>
      <div class="metric">
        <div class="metric-label">Wildcard Mask <InfoTip text="The inverse of the subnet mask. Used in ACLs and routing configs to specify which bits can vary." /></div>
        <div class="metric-value" style="font-size: 16px; font-family: monospace;">{result.wildcardMask}</div>
      </div>
      <div class="metric">
        <div class="metric-label">CIDR Notation</div>
        <div class="metric-value" style="font-size: 16px;">{result.networkAddress}{result.cidrNotation}</div>
      </div>
      <div class="metric">
        <div class="metric-label">IP Class</div>
        <div class="metric-value" style="font-size: 16px;">{result.ipClass}</div>
      </div>
      <div class="metric">
        <div class="metric-label">Private Address?</div>
        <div class="metric-value" style="font-size: 16px;">
          {#if result.isPrivate}
            <span class="badge badge-green">Yes (Private)</span>
          {:else}
            <span class="badge badge-amber">No (Public)</span>
          {/if}
        </div>
      </div>
    </div>

    <!-- Binary -->
    <div class="card">
      <div class="card-header">
        <span class="card-title">Binary Representation</span>
      </div>
      <div class="card-body" style="font-family: monospace; font-size: 13px; line-height: 2;">
        <div style="display: flex; gap: 12px;">
          <span style="color: var(--color-text-muted); width: 80px; flex-shrink: 0;">IP:</span>
          <span style="color: var(--color-accent); word-break: break-all;">{result.binaryIp}</span>
        </div>
        <div style="display: flex; gap: 12px;">
          <span style="color: var(--color-text-muted); width: 80px; flex-shrink: 0;">Mask:</span>
          <span style="color: var(--color-text); word-break: break-all;">{result.binaryMask}</span>
        </div>
      </div>
    </div>
  {:else}
    <div class="card">
      <div class="card-body" style="text-align: center; padding: 32px 20px;">
        <p style="color: var(--color-text-muted); font-size: 13px;">Enter a valid IPv4 address to calculate subnet details.</p>
      </div>
    </div>
  {/if}

  <!-- Cheatsheet -->
  <div class="card">
    <div class="card-header">
      <span class="card-title">Common Subnets</span>
    </div>
    <div class="card-body" style="padding: 0; overflow-x: auto;">
      <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
        <thead>
          <tr style="border-bottom: 1px solid var(--color-border);">
            <th style="padding: 10px 16px; text-align: left; color: var(--color-text-muted); font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase;">CIDR</th>
            <th style="padding: 10px 16px; text-align: left; color: var(--color-text-muted); font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase;">Subnet Mask</th>
            <th style="padding: 10px 16px; text-align: right; color: var(--color-text-muted); font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase;">Usable Hosts</th>
          </tr>
        </thead>
        <tbody>
          {#each cheatsheet as row}
            <tr style="border-bottom: 1px solid var(--color-border);">
              <td style="padding: 8px 16px; color: var(--color-accent); font-family: monospace;">{row.cidr}</td>
              <td style="padding: 8px 16px; color: var(--color-text); font-family: monospace;">{row.mask}</td>
              <td style="padding: 8px 16px; text-align: right; color: var(--color-text);">{row.hosts.toLocaleString()}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</div>
