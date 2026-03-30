export interface Tool {
  id: string;
  name: string;
  path: string;
  description: string;
  icon: string;
  keywords: string[];
  group: string;
}

export const groups = [
  { label: "Network", ids: ["my-ip", "privacy-check", "webrtc-leak-test"] },
  { label: "Calculators", ids: ["subnet-calculator", "ip-converter", "password-strength", "jwt-decoder"] },
];

export const tools: Tool[] = [
  {
    id: "my-ip",
    name: "What Is My IP",
    path: "/my-ip",
    description: "See your public IP address, location, ISP, and network details",
    icon: "IP",
    keywords: ["what is my ip", "my ip address", "check ip", "public ip"],
    group: "Network",
  },
  {
    id: "privacy-check",
    name: "Browser Privacy Check",
    path: "/privacy-check",
    description: "Check your browser's privacy settings, tracking protection, and fingerprint exposure",
    icon: "\u{1F6E1}",
    keywords: ["browser privacy check", "privacy test", "tracking protection", "fingerprint test"],
    group: "Network",
  },
  {
    id: "webrtc-leak-test",
    name: "WebRTC Leak Test",
    path: "/webrtc-leak-test",
    description: "Check if WebRTC is leaking your real IP address",
    icon: "\u26A0",
    keywords: ["webrtc leak test", "webrtc ip leak", "vpn leak test"],
    group: "Network",
  },
  {
    id: "subnet-calculator",
    name: "Subnet Calculator",
    path: "/subnet-calculator",
    description: "Calculate network address, broadcast, host range from CIDR notation",
    icon: "\u229E",
    keywords: ["subnet calculator", "cidr calculator", "ip subnet", "network calculator"],
    group: "Calculators",
  },
  {
    id: "ip-converter",
    name: "IP Address Converter",
    path: "/ip-converter",
    description: "Convert IP addresses between decimal, binary, hexadecimal, and octal",
    icon: "\u21C4",
    keywords: ["ip converter", "ip to binary", "ip to hex", "decimal to ip"],
    group: "Calculators",
  },
  {
    id: "password-strength",
    name: "Password Strength Checker",
    path: "/password-strength",
    description: "Analyze password entropy, crack time estimation, and strength rating",
    icon: "\u{1F511}",
    keywords: ["password strength", "password checker", "how strong is my password", "password entropy"],
    group: "Calculators",
  },
  {
    id: "jwt-decoder",
    name: "JWT Decoder",
    path: "/jwt-decoder",
    description: "Decode and inspect JSON Web Tokens \u2014 header, payload, and signature",
    icon: "JWT",
    keywords: ["jwt decoder", "jwt debugger", "decode jwt", "json web token"],
    group: "Calculators",
  },
];
