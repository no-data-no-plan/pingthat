<script lang="ts">
  let password = $state("");
  let showPassword = $state(false);
  let copiedGenerated = $state(false);

  const COMMON_PASSWORDS = [
    "password", "123456", "12345678", "qwerty", "abc123", "monkey", "master",
    "dragon", "111111", "baseball", "iloveyou", "trustno1", "sunshine", "letmein",
    "football", "shadow", "michael", "654321", "jordan", "superman", "harley",
    "1234567", "fuckme", "hunter", "fuckyou", "ranger", "buster", "thomas",
    "tigger", "robert", "soccer", "hockey", "killer", "george", "andrew",
    "charlie", "666666", "access", "thunder", "biteme", "merlin", "cowboys",
    "dallas", "austin", "ncc1701", "winter", "summer", "spring", "autumn",
    "hello", "love", "princess", "admin", "welcome", "flower", "hottie",
    "loveme", "zaq1zaq1", "password1", "password123", "000000", "987654321",
    "starwars", "matrix", "passw0rd", "pass", "pass1234", "qwerty123",
    "1qaz2wsx", "qazwsx", "trustno1", "whatever", "nothing", "banana",
    "secret", "test", "test123", "123123", "121212", "696969", "batman",
    "112233", "asdfgh", "zxcvbn", "mustang", "pepper", "joshua", "william",
    "123456789", "1234567890", "88888888", "abcdef", "computer", "jennifer",
    "amanda", "nicole", "chelsea", "biteme", "matthew", "access14", "yankees",
    "987654", "dallas1", "austin1", "marina", "ginger", "cookie", "scooter",
    "sparky", "snoopy", "corvette", "camaro", "mercedes", "peanut",
  ];

  interface Analysis {
    length: number;
    uppercase: number;
    lowercase: number;
    digits: number;
    special: number;
    entropy: number;
    strength: number;
    strengthLabel: string;
    isCommon: boolean;
    hasRepeated: boolean;
    hasSequential: boolean;
    crackTimes: { speed: string; time: string }[];
    tips: string[];
  }

  function analyzePassword(pw: string): Analysis | null {
    if (!pw) return null;

    const length = pw.length;
    let uppercase = 0, lowercase = 0, digits = 0, special = 0;
    for (const ch of pw) {
      if (/[A-Z]/.test(ch)) uppercase++;
      else if (/[a-z]/.test(ch)) lowercase++;
      else if (/[0-9]/.test(ch)) digits++;
      else special++;
    }

    // Charset size
    let charsetSize = 0;
    if (lowercase > 0) charsetSize += 26;
    if (uppercase > 0) charsetSize += 26;
    if (digits > 0) charsetSize += 10;
    if (special > 0) charsetSize += 33;
    if (charsetSize === 0) charsetSize = 26;

    const entropy = Math.round(length * Math.log2(charsetSize) * 100) / 100;

    // Common check
    const isCommon = COMMON_PASSWORDS.includes(pw.toLowerCase());

    // Repeated chars (3+ in a row)
    const hasRepeated = /(.)\1{2,}/.test(pw);

    // Sequential (abc, 123, etc.)
    let hasSequential = false;
    for (let i = 0; i < pw.length - 2; i++) {
      const c1 = pw.charCodeAt(i);
      const c2 = pw.charCodeAt(i + 1);
      const c3 = pw.charCodeAt(i + 2);
      if (c2 - c1 === 1 && c3 - c2 === 1) { hasSequential = true; break; }
      if (c1 - c2 === 1 && c2 - c3 === 1) { hasSequential = true; break; }
    }

    // Strength (0-4)
    let strength = 0;
    if (isCommon) {
      strength = 0;
    } else {
      if (entropy >= 25) strength++;
      if (entropy >= 40) strength++;
      if (entropy >= 60) strength++;
      if (entropy >= 80) strength++;
      if (hasRepeated && strength > 0) strength--;
      if (hasSequential && strength > 0) strength--;
      if (length < 6) strength = Math.min(strength, 0);
    }

    const labels = ["Very Weak", "Weak", "Fair", "Strong", "Very Strong"];
    const strengthLabel = labels[Math.max(0, Math.min(4, strength))];

    // Crack times
    const combinations = Math.pow(charsetSize, length);
    const speeds = [
      { speed: "1K/s (online)", rate: 1e3 },
      { speed: "1M/s (fast hash)", rate: 1e6 },
      { speed: "1B/s (GPU)", rate: 1e9 },
      { speed: "100B/s (cluster)", rate: 1e11 },
    ];

    function formatTime(seconds: number): string {
      if (seconds < 0.001) return "Instant";
      if (seconds < 1) return "< 1 second";
      if (seconds < 60) return `${Math.round(seconds)} seconds`;
      if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
      if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
      if (seconds < 86400 * 365) return `${Math.round(seconds / 86400)} days`;
      if (seconds < 86400 * 365 * 1000) return `${Math.round(seconds / (86400 * 365))} years`;
      if (seconds < 86400 * 365 * 1e6) return `${(seconds / (86400 * 365 * 1000)).toFixed(0)}K years`;
      if (seconds < 86400 * 365 * 1e9) return `${(seconds / (86400 * 365 * 1e6)).toFixed(0)}M years`;
      return "Centuries+";
    }

    const crackTimes = speeds.map(({ speed, rate }) => ({
      speed,
      time: isCommon ? "Instant (common)" : formatTime(combinations / rate / 2),
    }));

    // Tips
    const tips: string[] = [];
    if (isCommon) tips.push("This is a commonly used password. Choose something unique.");
    if (length < 12) tips.push("Use at least 12 characters for better security.");
    if (uppercase === 0) tips.push("Add uppercase letters.");
    if (lowercase === 0) tips.push("Add lowercase letters.");
    if (digits === 0) tips.push("Add numbers.");
    if (special === 0) tips.push("Add special characters (!@#$%...).");
    if (hasRepeated) tips.push("Avoid repeated characters (aaa, 111).");
    if (hasSequential) tips.push("Avoid sequential characters (abc, 123).");

    return {
      length, uppercase, lowercase, digits, special,
      entropy, strength, strengthLabel, isCommon,
      hasRepeated, hasSequential, crackTimes, tips,
    };
  }

  let analysis = $derived(analyzePassword(password));

  const strengthColors = ["var(--color-red)", "#f97316", "var(--color-amber)", "var(--color-green)", "var(--color-accent)"];

  function generatePassword() {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+[]{}|;:,.<>?";
    const arr = new Uint32Array(16);
    crypto.getRandomValues(arr);
    let pw = "";
    for (let i = 0; i < 16; i++) {
      pw += chars[arr[i] % chars.length];
    }
    // Ensure at least one of each type
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const digit = "0123456789";
    const spec = "!@#$%^&*()-_=+";
    const extra = new Uint32Array(4);
    crypto.getRandomValues(extra);
    const pwArr = pw.split("");
    pwArr[0] = upper[extra[0] % upper.length];
    pwArr[1] = lower[extra[1] % lower.length];
    pwArr[2] = digit[extra[2] % digit.length];
    pwArr[3] = spec[extra[3] % spec.length];
    password = pwArr.join("");
  }

  function copyGenerated() {
    if (!password) return;
    navigator.clipboard.writeText(password);
    copiedGenerated = true;
    setTimeout(() => (copiedGenerated = false), 1500);
  }
</script>

<div class="px-6 sm:px-8 py-6 space-y-6" style="max-width: 48rem; margin: 0 auto;">
  <!-- Privacy notice -->
  <div style="display: flex; align-items: center; gap: 8px; padding: 10px 16px; border-radius: 8px; background: var(--color-accent-dim); border: 1px solid rgba(16, 185, 129, 0.2);">
    <span style="font-size: 12px; color: var(--color-accent);">Your password never leaves your browser. All analysis is done locally.</span>
  </div>

  <!-- Input -->
  <div class="card">
    <div class="card-header">
      <span class="card-title">Enter Password</span>
      <div style="display: flex; gap: 8px;">
        <button class="btn-secondary" onclick={generatePassword}>Generate Strong</button>
        {#if password}
          <button class="btn-secondary" onclick={copyGenerated}>{copiedGenerated ? "Copied!" : "Copy"}</button>
        {/if}
      </div>
    </div>
    <div class="card-body">
      <div style="position: relative;">
        {#if showPassword}
          <input type="text" bind:value={password} placeholder="Type or paste a password..." style="width: 100%; padding-right: 60px; font-family: monospace;" />
        {:else}
          <input type="password" bind:value={password} placeholder="Type or paste a password..." style="width: 100%; padding-right: 60px;" />
        {/if}
        <button
          style="position: absolute; right: 8px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; font-size: 11px; color: var(--color-text-muted);"
          onclick={() => (showPassword = !showPassword)}
        >
          {showPassword ? "Hide" : "Show"}
        </button>
      </div>
    </div>
  </div>

  {#if analysis}
    <!-- Strength meter -->
    <div class="card">
      <div class="card-header">
        <span class="card-title">Strength</span>
        <span class="badge" style="background: {strengthColors[analysis.strength]}20; color: {strengthColors[analysis.strength]}; border: 1px solid {strengthColors[analysis.strength]}33;">
          {analysis.strengthLabel}
        </span>
      </div>
      <div class="card-body">
        <!-- Visual bar -->
        <div style="display: flex; gap: 4px; margin-bottom: 16px;">
          {#each [0, 1, 2, 3, 4] as i}
            <div style="flex: 1; height: 6px; border-radius: 3px; background: {i <= analysis.strength ? strengthColors[analysis.strength] : 'var(--color-surface2)'}; transition: background 0.2s;"></div>
          {/each}
        </div>

        <!-- Stats -->
        <div class="metrics-grid cols-3" style="margin-bottom: 0;">
          <div class="metric">
            <div class="metric-label">Entropy</div>
            <div class="metric-value" style="font-size: 16px;">{analysis.entropy} bits</div>
          </div>
          <div class="metric">
            <div class="metric-label">Length</div>
            <div class="metric-value" style="font-size: 16px;">{analysis.length}</div>
          </div>
          <div class="metric">
            <div class="metric-label">Composition</div>
            <div class="metric-sub" style="margin-top: 0; font-size: 11px; line-height: 1.6;">
              {#if analysis.uppercase > 0}<span style="color: var(--color-text);">A-Z: {analysis.uppercase}</span><br/>{/if}
              {#if analysis.lowercase > 0}<span style="color: var(--color-text);">a-z: {analysis.lowercase}</span><br/>{/if}
              {#if analysis.digits > 0}<span style="color: var(--color-text);">0-9: {analysis.digits}</span><br/>{/if}
              {#if analysis.special > 0}<span style="color: var(--color-text);">Special: {analysis.special}</span>{/if}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Checks -->
    <div class="card">
      <div class="card-header">
        <span class="card-title">Checks</span>
      </div>
      <div class="card-body" style="padding: 0;">
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 20px; border-bottom: 1px solid var(--color-border);">
          <span style="font-size: 13px; color: var(--color-text);">Common password?</span>
          {#if analysis.isCommon}
            <span class="badge badge-red">Yes</span>
          {:else}
            <span class="badge badge-green">No</span>
          {/if}
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 20px; border-bottom: 1px solid var(--color-border);">
          <span style="font-size: 13px; color: var(--color-text);">Repeated characters?</span>
          {#if analysis.hasRepeated}
            <span class="badge badge-amber">Yes</span>
          {:else}
            <span class="badge badge-green">No</span>
          {/if}
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 20px;">
          <span style="font-size: 13px; color: var(--color-text);">Sequential characters?</span>
          {#if analysis.hasSequential}
            <span class="badge badge-amber">Yes</span>
          {:else}
            <span class="badge badge-green">No</span>
          {/if}
        </div>
      </div>
    </div>

    <!-- Crack times -->
    <div class="card">
      <div class="card-header">
        <span class="card-title">Estimated Crack Time</span>
      </div>
      <div class="card-body" style="padding: 0;">
        {#each analysis.crackTimes as ct}
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 20px; border-bottom: 1px solid var(--color-border);">
            <span style="font-size: 12px; color: var(--color-text-muted);">{ct.speed}</span>
            <span style="font-size: 13px; font-weight: 500; color: var(--color-text);">{ct.time}</span>
          </div>
        {/each}
      </div>
    </div>

    <!-- Tips -->
    {#if analysis.tips.length > 0}
      <div class="card">
        <div class="card-header">
          <span class="card-title">Tips to Improve</span>
        </div>
        <div class="card-body">
          <ul style="list-style: none; padding: 0; margin: 0;">
            {#each analysis.tips as tip}
              <li style="font-size: 13px; color: var(--color-text-muted); padding: 4px 0; display: flex; align-items: baseline; gap: 8px;">
                <span style="color: var(--color-amber); flex-shrink: 0;">&#x25B8;</span>
                {tip}
              </li>
            {/each}
          </ul>
        </div>
      </div>
    {/if}
  {/if}
</div>
