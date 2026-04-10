import { describe, it, expect } from 'vitest';

/**
 * Tests for subnet calculation logic extracted from SubnetCalculator.svelte.
 * We re-implement the pure functions here since they're inline in the component.
 */

// ─── Pure functions (copied from SubnetCalculator.svelte) ─────────────────────

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

function calculateSubnet(ipInput: string, cidr: number): SubnetResult | null {
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
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('parseIp', () => {
  it('parses valid IPv4 addresses', () => {
    expect(parseIp('192.168.1.0')).toEqual([192, 168, 1, 0]);
    expect(parseIp('0.0.0.0')).toEqual([0, 0, 0, 0]);
    expect(parseIp('255.255.255.255')).toEqual([255, 255, 255, 255]);
    expect(parseIp('10.0.0.1')).toEqual([10, 0, 0, 1]);
  });

  it('trims whitespace', () => {
    expect(parseIp('  192.168.1.0  ')).toEqual([192, 168, 1, 0]);
  });

  it('rejects invalid IPs', () => {
    expect(parseIp('')).toBeNull();
    expect(parseIp('abc')).toBeNull();
    expect(parseIp('192.168.1')).toBeNull();
    expect(parseIp('192.168.1.1.1')).toBeNull();
    expect(parseIp('256.0.0.1')).toBeNull();
    expect(parseIp('-1.0.0.1')).toBeNull();
    expect(parseIp('192.168.1.abc')).toBeNull();
  });
});

describe('ipToInt and intToIp', () => {
  it('converts IP to integer and back', () => {
    const octets = [192, 168, 1, 0];
    const int = ipToInt(octets);
    expect(intToIp(int)).toBe('192.168.1.0');
  });

  it('handles 0.0.0.0', () => {
    expect(ipToInt([0, 0, 0, 0])).toBe(0);
    expect(intToIp(0)).toBe('0.0.0.0');
  });

  it('handles 255.255.255.255', () => {
    const int = ipToInt([255, 255, 255, 255]);
    expect(int).toBe(4294967295);
    expect(intToIp(4294967295)).toBe('255.255.255.255');
  });

  it('handles 10.0.0.1', () => {
    const int = ipToInt([10, 0, 0, 1]);
    expect(intToIp(int)).toBe('10.0.0.1');
  });
});

describe('intToBinary', () => {
  it('converts 192.168.1.0 correctly', () => {
    const int = ipToInt([192, 168, 1, 0]);
    expect(intToBinary(int)).toBe('11000000.10101000.00000001.00000000');
  });

  it('converts 0.0.0.0 correctly', () => {
    expect(intToBinary(0)).toBe('00000000.00000000.00000000.00000000');
  });

  it('converts 255.255.255.255 correctly', () => {
    expect(intToBinary(4294967295)).toBe('11111111.11111111.11111111.11111111');
  });
});

describe('getIpClass', () => {
  it('classifies Class A (0-127)', () => {
    expect(getIpClass(0)).toBe('A');
    expect(getIpClass(10)).toBe('A');
    expect(getIpClass(127)).toBe('A');
  });

  it('classifies Class B (128-191)', () => {
    expect(getIpClass(128)).toBe('B');
    expect(getIpClass(172)).toBe('B');
    expect(getIpClass(191)).toBe('B');
  });

  it('classifies Class C (192-223)', () => {
    expect(getIpClass(192)).toBe('C');
    expect(getIpClass(223)).toBe('C');
  });

  it('classifies Class D multicast (224-239)', () => {
    expect(getIpClass(224)).toBe('D (Multicast)');
    expect(getIpClass(239)).toBe('D (Multicast)');
  });

  it('classifies Class E reserved (240-255)', () => {
    expect(getIpClass(240)).toBe('E (Reserved)');
    expect(getIpClass(255)).toBe('E (Reserved)');
  });
});

describe('isPrivateIp', () => {
  it('detects 10.x.x.x as private', () => {
    expect(isPrivateIp([10, 0, 0, 1])).toBe(true);
    expect(isPrivateIp([10, 255, 255, 255])).toBe(true);
  });

  it('detects 172.16-31.x.x as private', () => {
    expect(isPrivateIp([172, 16, 0, 1])).toBe(true);
    expect(isPrivateIp([172, 31, 255, 255])).toBe(true);
  });

  it('rejects 172.15.x.x and 172.32.x.x as not private', () => {
    expect(isPrivateIp([172, 15, 0, 1])).toBe(false);
    expect(isPrivateIp([172, 32, 0, 1])).toBe(false);
  });

  it('detects 192.168.x.x as private', () => {
    expect(isPrivateIp([192, 168, 0, 1])).toBe(true);
    expect(isPrivateIp([192, 168, 255, 255])).toBe(true);
  });

  it('classifies public IPs as not private', () => {
    expect(isPrivateIp([8, 8, 8, 8])).toBe(false);
    expect(isPrivateIp([1, 1, 1, 1])).toBe(false);
    expect(isPrivateIp([192, 167, 1, 1])).toBe(false);
  });
});

describe('calculateSubnet', () => {
  it('calculates /24 correctly for 192.168.1.0', () => {
    const r = calculateSubnet('192.168.1.0', 24)!;
    expect(r).not.toBeNull();
    expect(r.networkAddress).toBe('192.168.1.0');
    expect(r.broadcastAddress).toBe('192.168.1.255');
    expect(r.firstHost).toBe('192.168.1.1');
    expect(r.lastHost).toBe('192.168.1.254');
    expect(r.totalHosts).toBe(254);
    expect(r.subnetMask).toBe('255.255.255.0');
    expect(r.wildcardMask).toBe('0.0.0.255');
    expect(r.cidrNotation).toBe('/24');
    expect(r.ipClass).toBe('C');
    expect(r.isPrivate).toBe(true);
  });

  it('calculates /32 (single host)', () => {
    const r = calculateSubnet('10.0.0.5', 32)!;
    expect(r.networkAddress).toBe('10.0.0.5');
    expect(r.broadcastAddress).toBe('10.0.0.5');
    expect(r.firstHost).toBe('10.0.0.5');
    expect(r.lastHost).toBe('10.0.0.5');
    expect(r.totalHosts).toBe(1);
    expect(r.subnetMask).toBe('255.255.255.255');
    expect(r.wildcardMask).toBe('0.0.0.0');
  });

  it('calculates /31 (point-to-point link)', () => {
    const r = calculateSubnet('10.0.0.4', 31)!;
    expect(r.networkAddress).toBe('10.0.0.4');
    expect(r.broadcastAddress).toBe('10.0.0.5');
    expect(r.firstHost).toBe('10.0.0.4');
    expect(r.lastHost).toBe('10.0.0.5');
    expect(r.totalHosts).toBe(2);
    expect(r.subnetMask).toBe('255.255.255.254');
  });

  it('calculates /16 (Class B-size)', () => {
    const r = calculateSubnet('172.16.5.100', 16)!;
    expect(r.networkAddress).toBe('172.16.0.0');
    expect(r.broadcastAddress).toBe('172.16.255.255');
    expect(r.firstHost).toBe('172.16.0.1');
    expect(r.lastHost).toBe('172.16.255.254');
    expect(r.totalHosts).toBe(65534);
    expect(r.subnetMask).toBe('255.255.0.0');
    expect(r.isPrivate).toBe(true);
  });

  it('calculates /8 (Class A-size)', () => {
    const r = calculateSubnet('10.1.2.3', 8)!;
    expect(r.networkAddress).toBe('10.0.0.0');
    expect(r.broadcastAddress).toBe('10.255.255.255');
    expect(r.totalHosts).toBe(16777214);
    expect(r.subnetMask).toBe('255.0.0.0');
  });

  it('calculates /0 (entire IPv4 space)', () => {
    const r = calculateSubnet('8.8.8.8', 0)!;
    expect(r.networkAddress).toBe('0.0.0.0');
    expect(r.broadcastAddress).toBe('255.255.255.255');
    expect(r.totalHosts).toBe(4294967294);
    expect(r.subnetMask).toBe('0.0.0.0');
    expect(r.wildcardMask).toBe('255.255.255.255');
  });

  it('calculates /28 correctly', () => {
    const r = calculateSubnet('192.168.1.100', 28)!;
    expect(r.networkAddress).toBe('192.168.1.96');
    expect(r.broadcastAddress).toBe('192.168.1.111');
    expect(r.firstHost).toBe('192.168.1.97');
    expect(r.lastHost).toBe('192.168.1.110');
    expect(r.totalHosts).toBe(14);
    expect(r.subnetMask).toBe('255.255.255.240');
    expect(r.wildcardMask).toBe('0.0.0.15');
  });

  it('correctly identifies public IP class and non-private', () => {
    const r = calculateSubnet('8.8.8.8', 24)!;
    expect(r.ipClass).toBe('A');
    expect(r.isPrivate).toBe(false);
  });

  it('returns null for invalid IP', () => {
    expect(calculateSubnet('invalid', 24)).toBeNull();
    expect(calculateSubnet('256.0.0.1', 24)).toBeNull();
    expect(calculateSubnet('', 24)).toBeNull();
  });

  it('calculates binary representations correctly', () => {
    const r = calculateSubnet('192.168.1.0', 24)!;
    expect(r.binaryIp).toBe('11000000.10101000.00000001.00000000');
    expect(r.binaryMask).toBe('11111111.11111111.11111111.00000000');
  });

  it('handles IP with host bits set (masks to network address)', () => {
    const r = calculateSubnet('192.168.1.200', 24)!;
    expect(r.networkAddress).toBe('192.168.1.0');
    expect(r.broadcastAddress).toBe('192.168.1.255');
  });
});
