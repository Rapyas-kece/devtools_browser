/**
 * CTF CHALLENGE 3: TAB SOURCES - EPHEMERAL MEMORY CAPTURE
 * 
 * MISI:
 * Pasang Breakpoint di file ini sebelum variabel rahasia dihapus dari memori!
 */

window.SourcesVaultEngine = {
  isBreached: false,

  generateClearanceKey: function() {
    const feedbackBox = document.getElementById('sources-result-box');
    if (!feedbackBox) return;

    feedbackBox.innerHTML = '<span style="color: #38bdf8;">⚙️ Menghasilkan token clearance di memori...</span>';

    // Tahap 1: Pembentukan Seed Kriptografis Lokal
    const seedA = "S0URC3S";
    const seedB = "BR34KP01NT";
    const seedC = "SC0P3_C4PTUR3";
    const seedD = "5521";

    // Tahap 2: Perakitan Flag di dalam Local Scope
    // 👇 PASANG BREAKPOINT DI BARIS INI ATAU DI BAWAHNYA 👇
    let ephemeralClearanceFlag = `FLAG{${seedA}_${seedB}_${seedC}_${seedD}}`;
    let systemAuthNonce = Math.floor(Math.random() * 900000) + 100000;

    // Tahap 3: Timer Pemusnahan Instan (50 ms)
    setTimeout(() => {
      // Menghapus dan menimpa variabel dari memori
      ephemeralClearanceFlag = null;
      systemAuthNonce = 0;

      // Update UI bahwa waktu telah habis
      feedbackBox.innerHTML = `
        <div style="color: #f43f5e; line-height: 1.5;">
          ⏱️ <strong>TOKEN MUSNAH DARI MEMORI! (50ms Time Exceeded)</strong><br>
          Token rahasia hanya eksis sesaat di dalam scope fungsi ini sebelum dihapus.<br>
          <span style="color: #94a3b8; font-size: 0.85rem;">
            Petunjuk: Buka tab <strong>Sources</strong> $\\rightarrow$ cari file <code>challenge_sources_vault.js</code> 
            $\\rightarrow$ klik nomor baris pembuatan <code>ephemeralClearanceFlag</code> untuk memasang <strong>Breakpoint</strong> 
            $\\rightarrow$ klik tombol lagi!
          </span>
        </div>
      `;
    }, 50);

    return "ROUTINE_STARTED";
  }
};
