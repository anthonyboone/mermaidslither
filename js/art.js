const svg=(body,view='0 0 24 24')=>`<svg viewBox="${view}" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${body}</svg>`;
export function icon(name) {
  const paths={
    wave:'<path d="M2 15c3-7 6 5 10-2s7 4 10-2M2 20c3-7 6 5 10-2s7 4 10-2M5 9a7 7 0 0 1 13-2"/>',
    clock:'<circle cx="12" cy="13" r="8"/><path d="M12 8v5l3 2M9 2h6M12 2v3M18 5l2 2"/>',
    star:'<path d="m12 2 2.9 6.2 6.8 1-5 4.8 1.2 6.8-5.9-3.2-6 3.2 1.2-6.8-5-4.8 6.9-1L12 2Z"/>',
    coral:'<path d="M12 22V8m0 7 6-4V5m-6 13-6-4V8m12 0 4-3V2M6 11 2 7V4m10 7 4-4V2M12 9 9 6V2"/>',
    play:'<path d="m9 5 11 7-11 7V5Z" fill="currentColor" stroke="none"/>',
    arrow:'<path d="M4 12h15m-6-6 6 6-6 6"/>',
    pearl:'<circle cx="12" cy="12" r="8"/><path d="M7 11a5 5 0 0 1 5-5"/>',
    shell:'<path d="m9 21-6-9C-2-2 26-2 21 12l-6 9H9Z"/><path d="m8 6 3 14m5-14-3 14m-1-15v15M5 10l5 10m9-10-5 10"/>',
    trophy:'<path d="M7 3h10v6a5 5 0 0 1-10 0V3Zm0 2H3v3c0 3 2 5 5 5m9-8h4v3c0 3-2 5-5 5m-4 1v5m-4 2h8"/>',
    settings:'<path d="m9 3-1 3-3 1-2 4 2 3v4l4 2 3-1 3 1 4-2v-4l2-3-2-4-3-1-1-3H9Z"/><circle cx="12" cy="12" r="3"/>',
    close:'<path d="m6 6 12 12M18 6 6 18"/>',
    pause:'<path d="M8 5v14M16 5v14" stroke-width="4"/>',
    sound:'<path d="m11 4-6 5H2v6h3l6 5V4Zm5 4a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
    check:'<path d="m5 12 4 4L19 6"/>',
    lock:'<rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V6a4 4 0 0 1 8 0v4m-4 5v2"/>',
    heart:'<path d="M12 21 3 12C-3 4 7-2 12 6c5-8 15-2 9 6l-9 9Z"/>',
    help:'<circle cx="12" cy="12" r="9"/><path d="M9 8c1-4 7-2 6 1 0 2-3 2-3 5m0 3v.1"/>',
    home:'<path d="m2 11 10-9 10 9M5 9v12h14V9m-10 12v-7h6v7"/>',
    bolt:'<path d="m14 2-9 12h6l-1 8 9-13h-6l1-7Z"/>',
    fin:'<path d="M3 20C4 6 12 8 17 2c-1 8 1 10 4 18H3Z"/>',
  };
  return svg(`<g stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${paths[name]||paths.star}</g>`);
}
export function buddyArt(id='turtle') {
  const common='<ellipse cx="70" cy="110" rx="35" ry="5" fill="#061f30" opacity=".14"/>';
  if(id==='cat') return svg(`${common}<path d="M102 80c39-31 42 13 10 20" fill="#ad8fdf"/><path d="m40 43-1-29 24 18m16-1 24-15 1 31" fill="#d4b9f4" stroke="#a18ac7" stroke-width="2"/><ellipse cx="70" cy="72" rx="38" ry="34" fill="#d4b9f4"/><ellipse cx="70" cy="81" rx="27" ry="22" fill="#eee0ff"/><circle cx="55" cy="61" r="4" fill="#153847"/><circle cx="85" cy="61" r="4" fill="#153847"/><path d="m66 72 4 4 4-4m-4 4v5m-16-4-18-4m18 11-18 3m50-10 18-4m-18 11 18 3" stroke="#79649e" stroke-width="2" stroke-linecap="round"/><path d="M46 96 34 110l28-8m32-6 12 14-28-8" fill="#ad8fdf"/><circle cx="44" cy="73" r="6" fill="#f6b9d6"/><circle cx="96" cy="73" r="6" fill="#f6b9d6"/>`,'0 0 140 125');
  if(id==='dolphin')return svg(`${common}<path d="M34 77C-7 64 4 39 32 54 25 20 79 11 102 43l26 7-22 14c-3 25-28 43-55 32l-12 16-6-18-21 4 15-19" fill="#9ddcf4"/><path d="M38 75c23 19 45 12 67-12-8 29-32 40-54 32Z" fill="#dcf5ff"/><path d="m65 32 7-22 17 27m-22 40-9 21 26-18" fill="#6db4db"/><circle cx="89" cy="49" r="4" fill="#143846"/><circle cx="90" cy="48" r="1.3" fill="white"/><path d="M96 66q-7 6-14 0" stroke="#3e7e99" stroke-width="2" stroke-linecap="round"/>`,'0 0 140 125');
  return svg(`${common}<path d="m39 65-25-6C-1 53 0 77 20 83l16 4m69-22 24-7c17-3 15 19-3 25l-17 4M46 92l-15 17c-7 7 14 8 24-4m39-13 15 17c7 7-14 8-24-4" fill="#7ac8a3"/><ellipse cx="71" cy="77" rx="42" ry="29" fill="#62af9b"/><path d="m50 59 21-8 23 10 8 22-21 19-29-7-12-19Z" fill="#a4dfac"/><path d="m50 59 11 16 22-1 11-13M61 75l-9 20m31-21-2 28" stroke="#62af9b" stroke-width="3"/><ellipse cx="72" cy="43" rx="25" ry="23" fill="#a9e7bc"/><circle cx="62" cy="39" r="3.5" fill="#133c3b"/><circle cx="82" cy="39" r="3.5" fill="#133c3b"/><circle cx="55" cy="48" r="5" fill="#ffc7c2"/><circle cx="89" cy="48" r="5" fill="#ffc7c2"/><path d="M66 49q6 7 12 0" stroke="#3e7d69" stroke-width="2" stroke-linecap="round"/>`,'0 0 140 125');
}
export function skinArt(skin) {
  const [a,b]=skin.colors;
  return svg(`<path d="M27 58C7 58 9 25 34 25s17 39 48 39 29-35 50-35" stroke="${b}" stroke-width="21" stroke-linecap="round"/><path d="M27 54C9 54 13 21 34 21s17 39 48 39 29-35 50-35" stroke="${a}" stroke-width="17" stroke-linecap="round"/><path d="m14 51-11-9 0 20 14-3m48-5-1-17 16 15m32-17-1-17 15 8" fill="${b}"/><ellipse cx="133" cy="28" rx="16" ry="14" fill="${a}"/><circle cx="136" cy="22" r="3" fill="#123e48"/><circle cx="136" cy="33" r="3" fill="#123e48"/><circle cx="137" cy="21" r="1" fill="white"/><path d="m143 25 3 3-3 3" stroke="#518b91" stroke-width="1.5" stroke-linecap="round"/>`,'0 0 160 85');
}
