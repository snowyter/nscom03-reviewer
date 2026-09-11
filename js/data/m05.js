window.NSCOM_MODULES = window.NSCOM_MODULES || [];
window.NSCOM_MODULES.push({
  id: "m05",
  num: 5,
  title: "Physical Layer — Multiplexing",
  accent: "#8ad4c8",
  icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 4h3l3.5 8L5 20H2"/><path d="M2 8h3"/><path d="M2 16h3"/><path d="M5 4h3l3.5 8L8 20H5"/><path d="M5 8h3"/><path d="M5 16h3"/><path d="M11.5 12h10"/><path d="M18 9l3 3-3 3"/></svg>`,
  summary:
    "Multiplexing is the set of techniques that allows the simultaneous transmission of several signals across one data link, so bandwidth utilisation is the theme: FDM and WDM share the medium in frequency, and TDM shares it in time. This module covers the efficiency-versus-privacy distinction between multiplexing and spreading; frequency-division multiplexing with guard bands, the modulator/bandpass-filter construction and the group, supergroup and mastergroup hierarchy of analog carrier systems; wavelength-division multiplexing as FDM for optical fibre, including prisms and the lightpath concept; synchronous TDM with frames, slots, interleaving and the three data-rate-management techniques (multilevel, multiple-slot, pulse stuffing); the DS/T-1 hierarchy; statistical TDM and why it is more efficient; and the FDM-versus-TDM comparison. Worked examples compute aggregate bit rate, frame rate, frame duration and the number of FDM channels a band can hold.",
  sections: [
    {
      id: "s1",
      title: "Bandwidth Utilisation: Multiplexing versus Spreading",
      body: [
        {
          type: "list",
          items: [
            "**Bandwidth utilisation** is using the link's spare capacity on purpose — and there are two ways to be wise about it.",
            "**Multiplexing** → efficiency: many signals share one link. **Spreading** → privacy and anti-jamming: one signal fills a wide band.",
            "Both assume the link's bandwidth **exceeds** the needs of the devices on it — otherwise there is nothing to share.",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "why the goals differ",
          body: [
            {
              type: "p",
              text: "Bandwidth utilisation is the wise use of available bandwidth to achieve specific goals, and the slides open with the two ways of being wise about it. Efficiency can be achieved by multiplexing; privacy and anti-jamming can be achieved by spreading. Both techniques take a medium whose capacity exceeds the needs of any one device and put more than one thing on it at the same time, but they pull in different directions. Multiplexing tries to waste as little bandwidth as possible; spreading deliberately uses a wide band, at some cost in efficiency, to gain resistance to interception and interference.",
            },
            {
              type: "list",
              items: [
                "Multiplexing — many signals share one link. Goal: efficiency, achieved by giving each signal only the slice it needs.",
                "Spreading — one signal is deliberately expanded across a wide band. Goal: privacy and anti-jamming, bought with bandwidth.",
                "Both assume the bandwidth of the link is greater than the bandwidth needs of the individual devices it serves; otherwise there is nothing to share.",
              ],
            },
            {
              type: "p",
              text: "The distinction is about what you are optimising. A multiplexer assumes the total load is well behaved and predictable, so it can allocate fixed slices — a frequency band, a time slot — and guarantee each source its share. Spreading assumes an adversary: a listener who wants to interpret the signal, or an interferer who wants to drown it. Spreading hides a narrow-band signal inside a wide-band one using a code known only to the intended receiver, so an eavesdropper who does not hold the code sees noise, and a narrow-band jammer can only affect the small fraction of the wide band it covers. Neither technique is universally better; they answer different questions.",
            },
            {
              type: "table",
              head: ["Technique", "Design goal", "Cost", "Typical use"],
              rows: [
                ["Multiplexing (FDM, WDM, TDM)", "Efficiency — use the medium fully", "Guard bands and framing overhead", "Trunk links, telephone backhaul, backbone fibre"],
                ["Spreading (FHSS, DSSS)", "Privacy and anti-jamming", "Bandwidth deliberately wasted", "Military radio, some wireless LANs and cellular"],
              ],
            },
            {
              type: "note",
              text: "Exam framing: if the question asks what is achieved by multiplexing, the answer is efficiency. If it asks what is achieved by spreading, the answer is privacy and anti-jamming. The sentence is quotable in exactly that form.",
            },
          ],
        },
      ],
    },
    {
      id: "s2",
      title: "What Multiplexing Is and the Three Families",
      body: [
        {
          type: "list",
          items: [
            "**Multiplexing** lets several transmissions cross one link **simultaneously**.",
            "**FDM** — analog, shares by **frequency** bands. **WDM** — the optical form of FDM.",
            "**TDM** — digital, shares by taking **turns in fixed time slots**.",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "the three families",
          body: [
            {
              type: "p",
              text: "Links can be shared whenever the bandwidth of a medium linking two devices is greater than the bandwidth needs of the devices. Multiplexing is the set of techniques that allows the simultaneous transmission of multiple signals across a single data link, and the slides name three members of the family: frequency-division multiplexing, wavelength-division multiplexing and synchronous time-division multiplexing. The economic logic is the same in all three. Laying cable is expensive; the capacity of installed cable, especially fibre, is enormous; so the useful engineering move is to load many low-rate streams onto one high-rate link rather than to install a separate link for each stream.",
            },
            {
              type: "list",
              items: [
                "Frequency-Division Multiplexing (FDM) — analog; streams share the link by occupying disjoint bands of frequency, all at once.",
                `Wavelength-Division Multiplexing (WDM) — analog; the optical form of FDM, where the "frequency" is a colour of light in a fibre.`,
                "Synchronous Time-Division Multiplexing (TDM) — digital; streams share the link by taking turns in fixed time slots.",
              ],
            },
            {
              type: "p",
              text: "A multiplexer is a many-to-one device: it accepts n input lines as a single output line whose capacity is the sum of what the inputs need, and the reciprocal device at the far end — the demultiplexer, or demux — is one-to-many, splitting the aggregate back into n streams addressed to the correct receivers. In practice the two are almost always packaged together as a multiplexer/demultiplexer pair, one at each end of the link, so that each direction of a full-duplex link gets its own mux/demux. Standard texts draw the demultiplexer as a filter or distributor whose output lines are routed by the channel identifier carried inside the composite signal.",
            },
            {
              type: "formula",
              tex: "\\text{Capacity of the link} = \\sum_{i=1}^{n} C_i \\quad\\text{plus overhead}",
              text: "The link must be able to carry at least the sum of the individual channel capacities C-sub-i, plus whatever overhead the technique adds (guard bands in FDM, framing bits in TDM). If it cannot, multiplexing is not possible.",
            },
            {
              type: "example",
              text: "A trunk has 1.0 Gbps of usable capacity and each of ten sites needs 60 Mbps. Before multiplexing, ten separate links would be needed. With a multiplexer, the aggregate demand is 10 × 60 Mbps = 600 Mbps, which fits comfortably in 1.0 Gbps, leaving 400 Mbps of headroom for overhead and growth. The medium is now serving ten customers instead of one.",
              steps: [
                "Total demand = 10 channels × 60 Mbps = 600 Mbps.",
                "Usable capacity = 1000 Mbps.",
                "600 ≤ 1000, so the ten channels can share one link.",
                "Unused headroom = 1000 − 600 = 400 Mbps.",
              ],
            },
          ],
        },
      ],
    },
    {
      id: "s3",
      title: "Frequency-Division Multiplexing (FDM)",
      body: [
        {
          type: "fig",
          fig: "m05-p04-frequency-division-multiplexing",
          caption: "Slide: FDM is an analog multiplexing technique that combines analog signals.",
        },
        {
          type: "fig",
          fig: "m05-p06-fdm-demultiplexing-example",
          caption: "Slide: filter and shift — bandpass filters separate the bands, then each is shifted back to baseband.",
        },
        {
          type: "list",
          items: [
            "**FDM** is analog: each input is modulated onto a **different carrier**, so each occupies a **disjoint frequency band**.",
            "The bands must not overlap, and **guard bands** are left between them to prevent interference.",
            "All inputs transmit **at once** — they are separated in frequency, not in time.",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "guard bands",
          body: [
            {
              type: "p",
              text: `FDM is an analog multiplexing technique that combines analog signals. Each input signal is modulated onto a different carrier frequency, so the signals occupy distinct, non-overlapping bands of the link's spectrum and travel simultaneously. At the receiving end a bank of bandpass filters separates the composite signal back into its constituents, each band is demodulated to recover the original baseband signal, and the stream is delivered to the right destination. The slides also call FDM the "frequency-division" technique in contrast with "time-division", which is exactly right: FDM divides frequency, TDM divides time.`,
            },
            {
              type: "h3",
              text: "The FDM process, step by step",
            },
            {
              type: "list",
              items: [
                "Each input signal m-i(t) is passed through a modulator, which multiplies it by a carrier at the channel's assigned centre frequency f-i.",
                "The modulated signal now occupies a band centred on f-i whose width equals the width of the original signal (for double-sideband amplitude modulation it is twice as wide, as the additive note below explains).",
                "The modulated signals are summed (combined) onto the shared link; because no two bands overlap, the sum is still separable.",
                "At the demultiplexer, n bandpass filters each tuned to one channel's band extract that band, and a demodulator shifts it back down to baseband.",
              ],
            },
            {
              type: "formula",
              tex: "B_{\\text{link}} \\;\\ge\\; \\sum_{i=1}^{n} B_i \\;+\\; (n-1)\\,B_g",
              text: "The link bandwidth must be at least the sum of the n channel bandwidths plus the guard bands between adjacent channels. With n channels there are n minus one internal gaps, each of width B-g, plus the outer edges.",
            },
            {
              type: "p",
              text: "Guard bands are the reason the sum of the channel bandwidths is not the whole story. Real filters have sloping rather than vertical skirts, and real oscillators drift with temperature, so adjacent channels need a gap of unused spectrum between them to stop one channel's energy leaking into its neighbour's passband. A guard band is therefore wasted bandwidth by design — you spend efficiency to buy separation. Fibre FDM and radio FDM use different guard-band sizes, but the principle is identical.",
            },
          ],
        },
      ],
    },
    {
      id: "s4",
      title: "Worked FDM Examples",
      body: [
        {
          type: "fig",
          fig: "m05-p06-fdm-demultiplexing-example",
          caption: "Slide figure for the 20–32 kHz example: three 4 kHz voice channels shifted and combined, then filtered and shifted back.",
        },
        {
          type: "list",
          items: [
            "The standard worked example: a voice channel occupies **4 kHz**; combine three of them onto one link.",
            "Each needs its own carrier, and the bands must be separated by **guard bands**.",
            "Total link bandwidth = (number of channels × channel width) **plus** the guard bands.",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "the worked sum",
          body: [
            {
              type: "p",
              text: "The slides give one worked FDM example and it is worth doing carefully, because every FDM exam question is a variation on it: assume that a voice channel occupies a bandwidth of 4 kHz, and combine three voice channels into a link with a bandwidth of 12 kHz, from 20 to 32 kHz, with no guard bands. The method is to shift (modulate) each voice channel to a different band: the first channel takes 20–24 kHz, the second 24–28 kHz and the third 28–32 kHz, and the three are then combined. The frequency-axis picture of this solution is the slide figure below.",
            },
            {
              type: "example",
              text: "Three 4 kHz voice channels, no guard bands, in the band 20–32 kHz. Channel 1 occupies 20–24 kHz, channel 2 occupies 24–28 kHz, channel 3 occupies 28–32 kHz. Total occupied bandwidth = 3 × 4 = 12 kHz, which exactly fills the 32 − 20 = 12 kHz link. The frequencies 20, 24, 28 and 32 kHz are the band edges; each modulator shifts its channel up from baseband (nominally 0–4 kHz) to its assigned slot.",
              steps: [
                "Available bandwidth = 32 − 20 = 12 kHz.",
                "Each channel needs 4 kHz, so with zero guards the number of channels is 12 / 4 = 3.",
                "Assign bands contiguously: ch1 = 20–24, ch2 = 24–28, ch3 = 28–32 kHz.",
                "Check: the three bands tile the whole range with no gap and no overlap, so the task is feasible.",
              ],
            },
            {
              type: "example",
              text: "A coaxial cable can carry signals from 100 kHz to 184 kHz, and each voice channel is 4 kHz wide with a 4 kHz guard band between neighbours. How many channels fit? Ignoring guard bands entirely would suggest (184 − 100)/4 = 84/4 = 21 channels, but that figure is wrong because it fails to pay for separation. With a guard band after every channel except the last, the block occupied by n channels is 4n + 4(n − 1) kHz. For 11 channels that is 44 + 40 = 84 kHz, exactly filling the 84 kHz available; pushing to 12 channels would need 48 + 44 = 92 kHz and overflow the band, so the honest answer is 11 channels.",
              steps: [
                "Bandwidth available = 184 − 100 = 84 kHz.",
                "With guards, block width for n channels = 4n + 4(n − 1) = 8n − 4 kHz.",
                "Set 8n − 4 ≤ 84 → 8n ≤ 88 → n ≤ 11.",
                "11 channels: occupied = 8(11) − 4 = 84 kHz, exactly filling 100 → 184 kHz (channels at 100–104, 108–112, … , 180–184 kHz).",
                "Check the next one: 12 channels would need 8(12) − 4 = 92 kHz, which exceeds the 84 kHz available.",
                "The 21-channel answer is the trap: it ignores guards and would need overlapping bands.",
              ],
            },
            {
              type: "note",
              text: "A safe habit for FDM questions: write the inequality before you divide. Number of channels n satisfies  n·B_ch + (n−1)·B_g ≤ B_band. Solving for n and flooring gives the answer, and the naive B_band / B_ch is only correct when B_g = 0.",
            },
          ],
        },
      ],
    },
    {
      id: "s5",
      title: "Additive Depth: the FDM Hierarchy and Analog Carrier Systems",
      body: [
        {
          type: "list",
          items: [
            "Real telephone networks multiplexed **groups of groups** — a hierarchy, not a single stage.",
            "12 voice channels → one **group**; groups → a **supergroup**; and so on upward.",
            "The hierarchy exists because the hardware is **modular**: the same 12-input mux is reused at each level with different carriers.",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "the group hierarchy",
          body: [
            {
              type: "p",
              text: "Real telephone networks did not multiplex a handful of voice channels once; they multiplexed multiplexed groups. Standard texts (Forouzan's framework, which these slides follow) describe a hierarchy imposed by the American Telephone and Telegraph company that stacks voice channels into groups, supergroups and mastergroups. The original 4 kHz voice channel is the unit; a group is 12 voice channels, occupying 48 kHz plus guards so that the group sits in 60 kHz (12 × 4 kHz of signal and 12 kHz of guard). A supergroup is five groups — 60 voice channels — and a mastergroup is ten supergroups, or 600 voice channels. Each level is produced by the same process: modulate each group onto a different carrier, sum, and filter.",
            },
            {
              type: "table",
              head: ["Level", "Composition", "Voice channels", "Notes"],
              rows: [
                ["Voice channel", "One telephone channel", "1", "4 kHz of spectrum allocated per voice channel"],
                ["Group", "12 voice channels", "12", "Built by modulating 12 channels to a 60 kHz group band with guard bands"],
                ["Supergroup", "5 groups", "60", "5 × 12 channels; combines group signals onto a wider band"],
                ["Mastergroup", "10 supergroups", "600", "Top level of the classical hierarchy; 600 × 12 = 7200 channels in an even larger assembly"],
              ],
            },
            {
              type: "p",
              text: "The hierarchy exists because the multiplexing hardware is modular. A mux that takes 12 inputs and produces one group output can be used unchanged at the next level with a different set of carrier frequencies; you grow capacity by adding stages rather than by redesigning the whole transmitter. That is the same decomposition idea modern digital hierarchies use with DS-0, DS-1 and beyond, which is why the two structures are usually taught side by side.",
            },
            {
              type: "formula",
              tex: "12 \\text{ ch} \\to \\text{group},\\quad 5 \\text{ groups} \\to \\text{supergroup},\\quad 10 \\text{ supergroups} \\to \\text{mastergroup}",
              text: "Twelve voice channels form a group, five groups form a supergroup, and ten supergroups form a mastergroup: 12, then 60, then 600 voice channels as you climb the hierarchy.",
            },
            {
              type: "example",
              text: "How many voice channels does a mastergroup carry, and how much of its spectrum is spent on separation? The channel count is 10 supergroups × 5 groups × 12 channels = 600 channels. If each channel occupies 4 kHz, the signal consumes 600 × 4 = 2400 kHz. Place those 600 channels in a band of 4004 kHz — 12 voice channels in a 60 kHz group, five groups in a 300 kHz supergroup plus guards, and so on up — and the spectrum not carrying voice is 4004 − 2400 = 1604 kHz, roughly 40 % of the band. That is the hierarchy's price: the higher you stack it, the more spectrum guards consume.",
              steps: [
                "Channels = 10 × 5 × 12 = 600.",
                "Signal bandwidth = 600 × 4 kHz = 2400 kHz.",
                "Illustrative mastergroup band = 4004 kHz.",
                "Guard and overhead = 4004 − 2400 = 1604 kHz, about 40 % of the band.",
              ],
            },
            {
              type: "note",
              text: "You are not expected to memorise carrier frequencies for each level. Learn the structure — 12, 5, 10 — and the idea that each level repeats the same modulate-sum-filter process, and you can reconstruct any question about it.",
            },
          ],
        },
      ],
    },
    {
      id: "s6",
      title: "Wavelength-Division Multiplexing (WDM)",
      body: [
        {
          type: "fig",
          fig: "m05-p09-wavelength-division-multiplexing",
          caption: "Slide: WDM is an analog multiplexing technique to combine optical signals.",
        },
        {
          type: "list",
          items: [
            `**WDM** is FDM applied to **fibre**: the "frequency" is a **colour of light**.`,
            "A **prism** separates the colours at the receiver end — that is the whole picture.",
            "It is how a single fibre carries many independent channels at once.",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "the prism picture",
          body: [
            {
              type: "p",
              text: "WDM is an analog multiplexing technique to combine optical signals. Conceptually it is FDM applied to a fibre-optic cable, and the slides make the equivalence explicit: in fibre the carrier is light and the parameter that separates channels is wavelength rather than frequency, so the technique carries a different name while doing the same job. When the wavelengths used are very closely spaced, modern terminology calls the technique dense WDM, or DWDM, but the underlying idea — independent signals sharing one fibre in parallel bands of the optical spectrum — is unchanged.",
            },
            {
              type: "h3",
              text: "The prism picture",
            },
            {
              type: "p",
              text: "Optical multiplexing and demultiplexing are often drawn with a prism because a prism refracts different wavelengths by different amounts. A beam of white light entering a prism separates into its colour components; run the process backwards, and a prism can combine several coloured beams into one composite beam that a single fibre then carries, and a second prism at the far end separates them again. In a real WDM system the prism is replaced by an optical multiplexer such as a diffraction grating or a thin-film filter, but the diagram remains the standard mental model because it makes the physics obvious: distinct wavelengths are made to travel different paths, then merged into one.",
            },
            {
              type: "list",
              items: [
                "Two optical fibres, one for each direction, connect the two ends; each fibre carries all the wavelengths travelling that way.",
                "At each end a prism (or optical mux/demux) combines the incoming wavelengths onto the fibre or splits them off it.",
                "A fibre's enormous bandwidth — tens of terabits per second in principle — is what makes many parallel wavelengths worthwhile.",
              ],
            },
            {
              type: "p",
              text: "A lightpath is the end-to-end optical channel created by one wavelength across a WDM network. Once wavelength λ-1 is assigned from a source to a destination, every optical switch along the way can forward that colour as a unit without converting it to electronics: the path is a circuit through the optical layer. This matters because wavelength conversion is expensive and lossy, so a network that can route whole lightpaths optically avoids regeneration at every hop. The practical consequence is that WDM systems commonly mix traffic at four granularities — a whole fibre, a whole band of wavelengths, a group of wavelengths, or a single wavelength — and operators choose the granularity that matches the traffic, exactly as an FDM hierarchy chooses group or supergroup.",
            },
            {
              type: "table",
              head: ["Term", "Meaning", "Analogy in FDM"],
              rows: [
                ["Wavelength / colour", "The channel-carrier identity", "Carrier frequency"],
                ["Lightpath", "One wavelength's end-to-end path through the network", "One FDM channel carried end to end"],
                ["Prism / optical mux", "Combines or separates wavelengths", "Modulator bank plus bandpass filters"],
                ["DWDM", "Wavelengths spaced very closely together", "Tightly packed FDM channels with narrow guards"],
              ],
            },
            {
              type: "example",
              text: "One fibre carries 40 wavelengths and each wavelength runs at 10 Gbps. The aggregate capacity is 40 × 10 Gbps = 400 Gbps on a single strand. Groups of wavelengths can be assigned as one unit: if an operator hands out four wavelengths per customer, then 40 / 4 = 10 customers are served; at eight wavelengths per customer, 40 / 8 = 5 customers. The fibre's physical capacity did not change — only the granularity of what was sold from it.",
              steps: [
                "Aggregate = 40 wavelengths × 10 Gbps = 400 Gbps.",
                "4-wavelength granularity: 40 / 4 = 10 customers, each at 40 Gbps.",
                "8-wavelength granularity: 40 / 8 = 5 customers, each at 80 Gbps.",
                "16-wavelength granularity: 40 / 16 → only 2 whole groups fit (32 of 40 wavelengths used, 8 stranded).",
              ],
            },
          ],
        },
      ],
    },
    {
      id: "s7",
      title: "Time-Division Multiplexing (TDM)",
      body: [
        {
          type: "fig",
          fig: "m05-p10-time-division-mulitplexing",
          caption: "Slide: TDM is a digital multiplexing technique for combining several low-rate channels into one high-rate one.",
        },
        {
          type: "list",
          items: [
            "**TDM** is digital: the link is divided **in time**, not frequency.",
            "Each channel gets a **time slot**; all channels use the **whole bandwidth**, but only briefly.",
            "**FDM shares the spectrum. TDM shares the clock.**",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "slots and frames",
          body: [
            {
              type: "p",
              text: "TDM is a digital multiplexing technique for combining several low-rate channels into one high-rate one. Where FDM divides the frequency axis and gives every channel a slice permanently, TDM divides the time axis: each channel is given the whole bandwidth for a very short, recurring moment, and the moment repeats often enough to reconstruct the original stream. TDM is used for digital data, and it is the dominant technique in digital telephony and most wide-area digital trunks.",
            },
            {
              type: "table",
              head: ["", "FDM", "TDM"],
              rows: [
                ["What is shared", "The frequency spectrum", "The time axis"],
                ["Signal type", "Analog", "Digital"],
                ["Status of a channel", "Always transmitting, on its own band", "Transmitting only during its slot"],
                ["Separation at receiver", "Bandpass filters", "Frame timing (which slot belongs to whom)"],
                ["Overhead", "Guard bands", "Framing/synchronisation bits, idle slots"],
              ],
            },
            {
              type: "h3",
              text: "Frames, slots and interleaving",
            },
            {
              type: "p",
              text: "A TDM link carries the channels in frames. A frame is one complete cycle of the round-robin schedule: it consists of one or more slots, and within each frame every input channel is allotted at least one slot. During a channel's slot, the whole link capacity is available to that channel; the channel's data is placed into the slot, and the mux moves on to the next slot and the next channel. This taking-turns by blocks of bits is called interleaving, and it is the defining picture of TDM: the output stream is a rapid interleaving of pieces of the input streams.",
            },
            {
              type: "list",
              items: [
                "Frame — one round-robin cycle containing one slot (or more) for every channel.",
                "Slot — the unit allocated to a channel inside a frame; often one byte or one bit.",
                "Interleaving — the multiplexer's action of inserting successive channels' data into successive slots of the output.",
                "Frame rate — frames per second; equals the rate at which each source is sampled or fed.",
                "Frame duration — the time one frame occupies, the reciprocal of the frame rate.",
              ],
            },
            {
              type: "p",
              text: "Note the direction of the division. In TDM the link is faster than any input, so the link visits each input quickly enough to keep up. If an input feeds one byte per frame, and the frame repeats F times per second, that input is served at F bytes per second and the link carries n × one byte per frame at F frames per second, giving a link bit rate of F × n × 8 bits per second for byte slots.",
            },
            {
              type: "formula",
              tex: "\\text{Link bit rate} = \\text{frame rate} \\times \\text{frame size (bits)}",
              text: "The link bit rate equals the number of frames per second multiplied by the number of bits in each frame. Frame size in bits is the number of slots times the bits per slot (plus any framing bits).",
            },
          ],
        },
      ],
    },
    {
      id: "s8",
      title: "Synchronous TDM and the TDM Worked Example",
      body: [
        {
          type: "fig",
          fig: "m05-p11-synchronous-time-division-multiplexi",
          caption: "Slide: in synchronous TDM the data rate of the link is n times faster and the unit duration is n times shorter.",
        },
        {
          type: "list",
          items: [
            "In **synchronous TDM** the link rate is **n times** an input's rate, and each slot is **n times shorter**.",
            `"Synchronous" here means the **slots are pre-assigned**, not that clocks are exchanged.`,
            "Each station always gets the **same slot position** in every frame, whether or not it has data.",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "the TDM worked example",
          body: [
            {
              type: "p",
              text: "In synchronous TDM, the data rate of the link is n times faster and the unit duration is n times shorter. The word synchronous here does not mean that clocks are exchanged; it means that the slots are assigned by a fixed schedule. Every frame contains a slot for every input, whether or not that input has data to send. The mux walks the inputs in order, the demux walks the outputs in the same order, and the slot position itself is the addressing.",
            },
            {
              type: "formula",
              tex: "\\text{Link rate} = n \\times \\text{input rate} \\qquad \\text{Slot duration} = \\frac{\\text{unit duration}}{n}",
              text: "Synchronous TDM makes the link n times faster than one input, and each slot n times shorter than one input unit. The link finishes n unit-durations of work in the time one input takes to produce one unit.",
            },
            {
              type: "example",
              text: "Four channels are multiplexed using TDM. Each channel sends 100 bytes/s and the multiplexer places 1 byte per channel in each frame. Find the frame, its size, its duration, the frame rate and the link bit rate. Each frame carries 1 byte from each of the four channels, so its size is 4 bytes = 32 bits. Since each channel supplies 100 bytes/s and a frame takes 1 byte from each channel, the frame rate must be 100 frames/s. The link bit rate is 100 × 32 = 3200 bps, and the frame duration is 1/100 s = 10 ms.",
              steps: [
                "Frame size = 4 channels × 1 byte = 4 bytes = 32 bits.",
                "Frame rate = channel byte rate / bytes per frame per channel = 100 / 1 = 100 frames/s.",
                "Frame duration = 1 / 100 s = 0.01 s = 10 ms.",
                "Link bit rate = frame rate × frame size = 100 × 32 = 3200 bps.",
                "Cross-check: 4 channels × 100 bytes/s = 400 bytes/s = 400 × 8 = 3200 bps. ✔",
              ],
            },
            {
              type: "p",
              text: "Because synchronous TDM reserves a slot for every input in every frame, a channel with nothing to send still occupies its slot, and that slot is wasted. If an input is generating data at only a fraction of its allocated share, the aggregate link still runs at full speed and the excess is padding. A second, subtler problem is synchronisation: input rates must be exact multiples of the frame rate, or the slow channel will fall behind and the fast one will overrun its slot. Real systems therefore align all inputs to a common master clock and use the data-rate-management techniques of the next section to absorb the mismatch.",
            },
            {
              type: "note",
              text: "Framing adds a further slot or bit for synchronisation. A T-1 frame, for example, adds one framing bit to 24 byte-slots, so the frame is 24 × 8 + 1 = 193 bits rather than 192 — that extra bit costs 1/193 ≈ 0.5 % of the link. Overhead like this is why link rate is always slightly above the sum of the payload rates.",
            },
          ],
        },
      ],
    },
    {
      id: "s9",
      title: "Data-Rate Management: Multilevel, Multiple-Slot and Pulse Stuffing",
      body: [
        {
          type: "list",
          items: [
            "Synchronous TDM is clean only when every input runs at the **same rate**. Real inputs do not.",
            "**Multilevel** — give a fast input more **bits per slot**. **Multiple-slot** — give it several slots per frame.",
            "**Pulse stuffing** — pad the slower inputs with dummy bits until all rates match.",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "the three techniques",
          body: [
            {
              type: "p",
              text: "Synchronous TDM only works cleanly when every input runs at the same rate and that rate is an exact submultiple of the link rate. Real inputs are neither: one terminal runs at 9600 bps, another at 19,200 bps, another at 56 kbps. Standard texts describe three techniques for making mismatched inputs fit a synchronous frame: multilevel multiplexing, multiple-slot multiplexing and pulse stuffing. Each answers a different kind of mismatch.",
            },
            {
              type: "list",
              items: [
                "Multilevel multiplexing — when one input's rate is an exact multiple of another's, give the fast input more bits per slot rather than more slots.",
                "Multiple-slot multiplexing — a fast input is allotted several slots in each frame; the slots need not be adjacent.",
                "Pulse stuffing (bit padding) — the highest input rate sets the frame rate, and slower inputs are padded with extra dummy bits until their rate matches.",
              ],
            },
            {
              type: "h3",
              text: "Multilevel multiplexing, worked",
            },
            {
              type: "example",
              text: "Two inputs run at 20 kbps and one at 40 kbps. The 40 kbps input is exactly twice the 20 kbps inputs, so it can carry two bits per slot while the slow inputs carry one. Each frame then holds 1 + 1 + 2 = 4 bits, and the frame rate equals the slow channels' bit rate: 20,000 frames/s. The aggregate is 20,000 × 4 bps = 80 kbps, which equals 20 + 20 + 40 kbps. The slow channels get 1 bit per frame, the fast channel 2 bits per frame, and every channel is served exactly.",
              steps: [
                "Fast : slow ratio = 40 / 20 = 2, so the fast input carries 2 bits per slow-slot's worth.",
                "Bits per frame = 1 (ch1) + 1 (ch2) + 2 (ch3) = 4 bits.",
                "Frame rate = 20,000 frames/s (set by the slow channels).",
                "Link rate = 20,000 × 4 = 80,000 bps = 80 kbps = 20 + 20 + 40 kbps. ✔",
              ],
            },
            {
              type: "h3",
              text: "Multiple-slot multiplexing and pulse stuffing, worked",
            },
            {
              type: "example",
              text: "Three inputs at 100 bytes/s, 200 bytes/s and 400 bytes/s share one TDM link by byte interleaving. The lowest rate sets the frame rate at 100 frames/s. In each frame the first input needs 1 byte, the second 2 bytes and the third 4 bytes, so a frame is 1 + 2 + 4 = 7 bytes = 56 bits, and the link runs at 100 × 56 = 5600 bps. As a check, 7 bytes per frame × 100 frames/s = 700 bytes/s = 5600 bps, and 100 + 200 + 400 = 700 bytes/s of demand. ✔",
              steps: [
                "Frame rate = lowest input rate = 100 frames/s.",
                "Bytes per frame = 100/100 + 200/100 + 400/100 = 1 + 2 + 4 = 7 bytes.",
                "Frame size = 7 × 8 = 56 bits.",
                "Link rate = 100 × 56 = 5600 bps = 700 bytes/s. ✔",
              ],
            },
            {
              type: "example",
              text: "Pulse stuffing: four synchronous inputs produce 10, 20, 25 and 25 bytes per second. The highest rate (25 bytes/s) dictates the frame rate, 25 frames/s, and every channel must deliver the same number of bytes per frame. Channel 1 has only 10 bytes/s available but must supply 25, so 15 padding bytes per second are inserted; channel 2 is padded by 5; channels 3 and 4 need no padding. The link then carries 4 bytes per frame × 25 frames/s = 100 bytes/s = 800 bps. Of every 100 bytes the link transports, 65 carry real data and 35 are stuffing.",
              steps: [
                "Frame rate = fastest channel's byte rate = 25 frames/s.",
                "Each frame needs 1 byte from each of 4 channels = 4 bytes/frame.",
                "Required input rates: ch1 10 → 25, pad 15 bytes/s; ch2 20 → 25, pad 5 bytes/s; ch3 25 → 25, pad 0; ch4 25 → 25, pad 0.",
                "Link rate = 25 × 4 = 100 bytes/s = 800 bps.",
                "Efficiency = useful 65 bytes/s ÷ 100 bytes/s = 65 %; stuffing = 35 bytes/s.",
              ],
            },
            {
              type: "note",
              text: "Pulse stuffing trades efficiency for simplicity: padding a slow channel wastes it every frame, but the receiver's job becomes trivial because every slot is a full byte. Choose stuffing when input rates are unpredictable; choose multilevel or multiple-slot when the ratios are known and fixed.",
            },
          ],
        },
      ],
    },
    {
      id: "s10",
      title: "Additive Depth: the DS and T-1 Hierarchy",
      body: [
        {
          type: "list",
          items: [
            "The digital counterpart of the FDM hierarchy is the **DS hierarchy**, built to carry digitised voice.",
            "One voice channel = **64 kbps** (8000 samples/s × 8 bits). That is **DS-0**.",
            "Levels stack upward: **DS-1** (T-1) carries **24** DS-0 channels = 1.544 Mbps.",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "DS-0 to T-1",
          body: [
            {
              type: "p",
              text: "The digital counterpart of the FDM group/supergroup hierarchy is the DS (digital signal) hierarchy, built to carry digitised voice. One voice channel, sampled 8000 times per second and quantised to 8 bits per sample, produces 64 kbps — this is DS-0. Twenty-four DS-0 channels are then interleaved byte by byte into one frame, with one framing bit added at the front, producing DS-1: a rate of 8000 × (24 × 8 + 1) = 8000 × 193 = 1,544,000 bps. The service that delivers a DS-1 is the T-1 line, and the two names are used almost interchangeably in practice.",
            },
            {
              type: "formula",
              tex: "R_{DS\\text{-}0} = 8000 \\times 8 = 64{,}000 \\text{ bps} \\qquad R_{DS\\text{-}1} = 8000 \\times (24 \\times 8 + 1) = 1{,}544{,}000 \\text{ bps}",
              text: "A DS-0 channel is 8000 samples per second times 8 bits, which is 64 kbps. A DS-1 frame adds one framing bit to 24 byte-slots, giving 193 bits per frame at 8000 frames per second, or 1.544 Mbps.",
            },
            {
              type: "table",
              head: ["Level", "Composition", "Bit rate", "Notes"],
              rows: [
                ["DS-0", "One digitised voice channel", "64 kbps", "8000 samples/s × 8 bits per sample"],
                ["DS-1 / T-1", "24 DS-0 channels + 1 framing bit", "1.544 Mbps", "8000 frames/s × 193 bits per frame"],
                ["T-2", "4 T-1 lines multiplexed", "6.312 Mbps", "Note 4 × 1.544 = 6.176 Mbps, so the extra 0.136 Mbps is per-level synchronisation overhead"],
                ["T-3", "7 T-2 lines (28 T-1)", "44.736 Mbps", "Again not an exact multiple: 7 × 6.312 = 44.184 Mbps plus overhead"],
                ["T-4", "6 T-3 lines (168 T-1)", "274.176 Mbps", "Top of the North American T-carrier ladder; 6 × 44.736 = 268.416 Mbps plus overhead"],
              ],
            },
            {
              type: "p",
              text: "Notice the structure repeats the group/supergroup logic: a fixed assembly of low-rate channels forms one higher-rate channel, and the next level treats that channel as its input. Notice too that the rate is not a clean multiple of the level below — T-2 is not exactly four times T-1, because each stage adds synchronisation overhead. That is the price of a hierarchy in which each level can be framed and tested independently. The European equivalent, E-carrier, uses 30 channels per E-1 at 2.048 Mbps, so the numbers differ between regions even though the design principle is the same.",
            },
            {
              type: "example",
              text: "How long does a T-1 line take to transmit one 1000-bit Ethernet frame if it is carried alone in a T-1 frame? A T-1 frame is 193 bits and repeats 8000 times per second, so an Ethernet frame of 1000 bits spans 1000 / 193 = 5.18 — that is, at least 6 T-1 frames. The payload capacity per frame is 192 bits (24 bytes), so 1000 bits need ceil(1000 / 192) = ceil(5.21) = 6 frames, at 8000 frames/s: 6 / 8000 s = 0.75 ms. The overhead — the framing bits and the unfilled tail of the last frame — costs real time.",
              steps: [
                "Payload per T-1 frame = 24 × 8 = 192 bits.",
                "Frames needed = ceil(1000 / 192) = 6 (the sixth carries only 64 useful bits).",
                "Time = 6 frames ÷ 8000 frames/s = 0.00075 s = 0.75 ms.",
                "For comparison, the bare payload time at 1.544 Mbps would be 1000 / 1,544,000 ≈ 0.648 ms, so framing and padding add about 16 %.",
              ],
            },
            {
              type: "note",
              text: `DS-1 is a rate and a format; T-1 is the line and the service that carries it. Exam answers that say "T-1 = 1.544 Mbps = 24 × 64 kbps + 8 kbps of overhead" are getting the arithmetic right: 24 × 64 = 1536 kbps, plus 8 kbps of framing = 1544 kbps.`,
            },
          ],
        },
      ],
    },
    {
      id: "s11",
      title: "Statistical (Asynchronous) TDM",
      body: [
        {
          type: "list",
          items: [
            "**Statistical TDM** abandons the fixed schedule: a mux looks only at inputs that **actually have data**.",
            "No idle slots are transmitted, so the **overhead of empty slots disappears** — that is the efficiency gain.",
            "The price: each block needs an **address**, so the demultiplexer knows where it belongs.",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "why addressing appears",
          body: [
            {
              type: "p",
              text: "Statistical TDM abandons the fixed-slot schedule. Instead of giving every input a slot in every frame, a statistical multiplexer looks only at the inputs that actually have data, takes their bytes, and packs them into the frame with an address tag identifying each block. Slots are dynamically allocated, and the frame therefore has no fixed per-channel structure at all. The technique is also called asynchronous TDM, because there is no rigid timing relationship between one channel's appearance and the next.",
            },
            {
              type: "p",
              text: "The payoff is efficiency. In the slide's comparison, five lines feed the multiplexer. Under synchronous TDM every frame must find a slot for each of the five lines, so idle channels produce empty slots that are transmitted and thrown away. Under statistical TDM only the lines with data contribute: the same information travels in fewer slots, so each frame carries less padding and the link's throughput of useful data rises. The real data rate approaches the link capacity, and a smaller link can serve the same traffic.",
            },
            {
              type: "list",
              items: [
                "No fixed slots: a channel appears in a frame only when it has something to send.",
                "Addressing is required: each data block carries an address so the demultiplexer knows its destination.",
                "No idle slots: the overhead of empty slots disappears, which is the source of the efficiency gain.",
                "Cost: synchronisation is no longer implicit in slot position, so addressing overhead is added and buffering is needed.",
              ],
            },
            {
              type: "p",
              text: "Suppose a statistical multiplexer serves n inputs whose average utilisation is u, meaning each is busy only a fraction u of the time. Synchronous TDM must size the link for n × (rate of one input), because every input could in principle be busy at once. Statistical TDM can size the link for the average aggregate n × u × (rate of one input), leaving headroom for buffering the moments when more inputs are busy than average. A typical office example uses 10 lines of 10 kbps each at 25 % utilisation: synchronous TDM needs 10 × 10 = 100 kbps of link, whereas the average demand is 10 × 0.25 × 10 = 25 kbps, and a link of about 75 kbps would normally be provisioned to keep the queueing delay acceptable.",
            },
            {
              type: "formula",
              tex: "C_{\\text{sync}} = n \\times R \\qquad C_{\\text{stat}} \\approx n \\times u \\times R \\;+\\; \\text{buffer headroom}",
              text: "A synchronous TDM link must be big enough for all n inputs at their full rate R. A statistical TDM link must be big enough for the average demand n times u times R, plus headroom to absorb bursts; the ratio C-stat over C-sync is roughly the utilisation u for the payload part.",
            },
            {
              type: "example",
              text: "Ten terminals each run at 10 kbps and are busy, on average, 25 % of the time. Synchronous TDM must provision 10 × 10 kbps = 100 kbps. Statistical TDM faces an average load of 10 × 0.25 × 10 = 25 kbps; allowing a large safety margin for the busy periods, a 75 kbps link suffices, a saving of 25 kbps — a quarter of the synchronous requirement. The saving is precisely the bandwidth that synchronous TDM spends on slots belonging to idle terminals.",
              steps: [
                "Synchronous requirement = n × R = 10 × 10 = 100 kbps.",
                "Average statistical load = n × u × R = 10 × 0.25 × 10 = 25 kbps.",
                "Provision 75 kbps (three times the average) to absorb bursts.",
                "Saving = 100 − 75 = 25 kbps, i.e. 25 % of the synchronous link.",
              ],
            },
            {
              type: "note",
              text: "Statistical TDM is not free. Since slots are not pre-assigned, each block needs an address, which is pure overhead; and because the aggregate rate varies, bursts must be buffered, which adds delay and jitter. Synchronous TDM is rigid but delay-bounded and simple; statistical TDM is efficient but statistical, and can overflow if too many inputs burst at once.",
            },
          ],
        },
      ],
    },
    {
      id: "s12",
      title: "Synchronous versus Statistical TDM, and FDM versus TDM",
      body: [
        {
          type: "fig",
          fig: "m05-p14-tdm-slot-comparison",
          caption: "Slide: the same five lines under synchronous TDM (fixed slots, including empty ones) and statistical TDM (only active lines are packed in).",
        },
        {
          type: "list",
          items: [
            "Synchronous TDM reserves a slot for **every** channel in **every** frame; statistical TDM allocates **only to channels with data**.",
            "Synchronous is **predictable** (good for real-time); statistical is **efficient** (good for bursty traffic).",
            "**FDM separates in frequency; TDM separates in time.** That single sentence answers most questions on this module.",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "the full comparison",
          body: [
            {
              type: "p",
              text: "The slide's TDM Slot Comparison makes the difference concrete. Five lines — A, B, C, D and E — feed the multiplexer. Under synchronous TDM (panel a) each frame reserves a slot for every line, so a frame reads A1, E2, D2, B2 and then 1, D1, B1, A1: the two frames together contain empty slots where a line had nothing to give and a stuffing slot where the mux was waiting. Under statistical TDM (panel b) the multiplexer packs only what is available, so the same information — A1, then E2 D2 B2, then D1 B1 A1 — fits into a shorter sequence with no idle slots at all. Same data, fewer transmitted slots: that is the efficiency claim in one picture.",
            },
            {
              type: "table",
              head: ["Aspect", "Synchronous TDM", "Statistical TDM"],
              rows: [
                ["Slot allocation", "Fixed: one or more slots per channel per frame", "Dynamic: slots given only to channels with data"],
                ["Empty slots", "Present and transmitted when a channel is idle", "Absent; no bandwidth wasted on idle channels"],
                ["Addressing", "Implicit in slot position", "Explicit address needed for each block"],
                ["Typical efficiency", "Lower — pays for idle time", "Higher — approaches the real data demand"],
                ["Complexity and buffering", "Simple, delay predictable", "Needs buffers; delay varies with load"],
                ["Best suited to", "Constant-rate streams such as digitised voice", "Bursty data such as terminal and computer traffic"],
              ],
            },
            {
              type: "example",
              text: "The same five lines under each scheme: suppose each active line delivers 1 byte per turn, and in a given period lines A, B, C and D are active while E is idle. Synchronous TDM transmits 5 slots per frame — 4 useful and 1 wasted on E — so its useful fraction is 4/5 = 80 %. Statistical TDM transmits the 4 useful slots only, so its useful fraction is 4/4 = 100 % of the slots it sends. The gain is the idle slot that no longer travels, and it grows as the number of idle lines grows.",
              steps: [
                "Synchronous frame: 5 slots for 5 lines, of which 4 carry data and 1 carries nothing but timing.",
                "Useful fraction of synchronous frame = 4 / 5 = 80 %.",
                "Statistical frame: 4 slots, all useful → 100 % useful.",
                "With k of n lines idle, synchronous useful fraction = (n − k)/n while statistical stays at 100 % of what it sends.",
              ],
            },
            {
              type: "p",
              text: "FDM and TDM are two different answers to the question of how to share one link. FDM slices the spectrum: each channel owns a band permanently and transmits continuously at low rate inside it. TDM slices time: each channel owns the whole spectrum for a short recurring instant and is silent the rest of the time. Because FDM channels are analog and always on, they suit continuously varying signals such as voice and broadcast radio; because TDM channels are digital and take turns, they suit bit streams and can be regenerated cleanly at each repeater, which is why digital trunking eventually displaced analog carrier systems.",
            },
            {
              type: "p",
              text: "There is also a hybrid worth knowing: when the available bandwidth is split into bands and each band is then time-shared, the scheme is called FDM/TDM or, on the wire, TDM over FDM. Modern digital subscriber lines use closely related ideas — dividing the available spectrum into many narrow subchannels and assigning bits to each according to the signal-to-noise ratio observed there — which is why the FDM-versus-TDM comparison is not a contest with a winner but a toolbox whose members are chosen to match the signal type, the medium and the traffic pattern.",
            },
            {
              type: "note",
              text: "A reliable exam sentence: FDM is an analog technique that divides the bandwidth of a link into frequency bands, one per channel, separated by guard bands; TDM is a digital technique that divides time into slots and gives each channel the whole bandwidth for its slot. WDM is FDM for optical fibre.",
            },
            {
              type: "example",
              text: "Decide the technique for each requirement. (a) Twelve always-on analog voice circuits over one coaxial trunk: FDM, because the signals are analog and continuous. (b) Four computers whose traffic is bursty and unpredictable: statistical TDM, because idle capacity is not wasted on waiting channels. (c) Forty 10 Gbps streams on one long-haul fibre: WDM, the optical form of FDM. (d) Twenty-four constant-rate 64 kbps digitised voice channels in one 1.544 Mbps frame: synchronous TDM (the T-1 format), because every channel is always active and the fixed schedule is deterministic.",
              steps: [
                "(a) Analog, continuous, many circuits → FDM with guard bands.",
                "(b) Digital and bursty → statistical TDM, which skips idle slots.",
                "(c) Optical carriers on fibre → WDM, the fibre analogue of FDM.",
                "(d) Constant-rate digital voice, always on → synchronous TDM, exactly the T-1/DS-1 case.",
              ],
            },
          ],
        },
      ],
    },
  ],
  flashcards: [
    { q: "What is bandwidth utilisation, and what goal does multiplexing serve?",
      a: "Bandwidth utilisation is the wise use of available bandwidth to achieve specific goals. Multiplexing achieves the goal of efficiency by letting several signals share one link; spreading achieves privacy and anti-jamming.", sec: "s1" },
    { q: "What is the essential difference in goal between multiplexing and spreading?",
      a: "Multiplexing buys efficiency — it wastes as little bandwidth as possible. Spreading deliberately widens a signal across a broad band to buy privacy and resistance to jamming, accepting an efficiency cost in exchange.", sec: "s1" },
    { q: "Define multiplexing.",
      a: "Multiplexing is the set of techniques that allows the simultaneous transmission of multiple signals across a single data link, which is worthwhile when the link's bandwidth exceeds the bandwidth needs of the devices it joins.", sec: "s2" },
    { q: "Name the three multiplexing techniques named in the slides.",
      a: "Frequency-Division Multiplexing (FDM), Wavelength-Division Multiplexing (WDM) and Synchronous Time-Division Multiplexing. WDM is essentially FDM for optical fibre.", sec: "s2" },
    { q: "What does FDM do, and what kind of signals does it combine?",
      a: "FDM is an analog multiplexing technique that combines analog signals by modulating each onto a different carrier frequency, so each occupies a distinct non-overlapping band of the link's spectrum and all travel at once.", sec: "s3" },
    { q: "Why are guard bands needed in FDM, and what do they cost?",
      a: "Real filters have sloping skirts and oscillators drift, so adjacent channels need unused spectrum between them to prevent one channel's energy leaking into the next. Guard bands cost bandwidth — they are deliberately wasted to buy channel separation.", sec: "s3" },
    { q: "How is an FDM signal separated at the receiving end?",
      a: "A bank of bandpass filters, each tuned to one channel's band, extracts that band from the composite signal; each extracted band is then demodulated — shifted back down to baseband. The slide label for this is filter and shift.", sec: "s3" },
    { q: "In the slide's FDM example, where do the three 4 kHz voice channels end up?",
      a: "The link runs from 20 to 32 kHz with no guard bands, so the channels occupy 20–24 kHz, 24–28 kHz and 28–32 kHz. Each is modulated from baseband up to its assigned band, then all three are combined.", sec: "s4" },
    { q: "How many 4 kHz voice channels fit between 100 kHz and 184 kHz with 4 kHz guard bands?",
      a: "Eleven. With guards, n channels occupy 4n + 4(n − 1) = 8n − 4 kHz, and 8n − 4 ≤ 84 kHz gives n ≤ 11. The naive 84/4 = 21 ignores the guards and is wrong.", sec: "s4" },
    { q: "Describe the classical FDM hierarchy in terms of channel counts.",
      a: "12 voice channels form a group, 5 groups form a supergroup (60 channels), and 10 supergroups form a mastergroup (600 channels). Each level is built by the same modulate-sum-filter process at a new set of carrier frequencies.", sec: "s5" },
    { q: "What is WDM, and how does it relate to FDM?",
      a: "WDM is an analog multiplexing technique to combine optical signals on a fibre. It is conceptually FDM applied to optics — the carrier is light and the channels are separated by wavelength rather than frequency, which is why it has a different name.", sec: "s6" },
    { q: "Why is a prism used to illustrate WDM?",
      a: "A prism refracts each wavelength by a different amount, so it can separate a composite beam into colours, or combine several coloured beams into one. It is the picture of the optical multiplexer/demultiplexer, even though real systems use gratings or thin-film filters.", sec: "s6" },
    { q: "What is a lightpath?",
      a: "A lightpath is the end-to-end optical channel created by one wavelength across a WDM network; optical switches along the route can forward that colour as a unit without converting it to electronics, which avoids expensive regeneration.", sec: "s6" },
    { q: "What is TDM, in one sentence?",
      a: "TDM is a digital multiplexing technique for combining several low-rate channels into one high-rate one by giving each channel the whole link for a short, recurring time slot.", sec: "s7" },
    { q: "What is a TDM frame, and what is a slot?",
      a: "A frame is one complete round-robin cycle containing one or more slots, with every channel allotted at least one slot. A slot is the unit allocated to a channel inside the frame, often one byte or one bit.", sec: "s7" },
    { q: "What is interleaving in TDM?",
      a: "Interleaving is the multiplexer's action of taking pieces of the input streams in turn — a byte from each channel in each frame — and emitting them in sequence on the output link so the channels appear to run simultaneously.", sec: "s7" },
    { q: "State the synchronous TDM relationship between link rate and input rate.",
      a: "In synchronous TDM the data rate of the link is n times faster than one input and the unit duration is n times shorter. The mux gives every one of the n inputs a slot in every frame.", sec: "s8" },
    { q: "In the slide's TDM example (four channels, 100 bytes/s each, 1 byte per channel per frame), give the frame size, frame rate, frame duration and bit rate.",
      a: "Frame size 4 bytes = 32 bits; frame rate 100 frames/s; frame duration 1/100 s = 10 ms; link bit rate 100 × 32 = 3200 bps.", sec: "s8" },
    { q: "Why does synchronous TDM waste bandwidth?",
      a: "Because a slot is reserved for every input in every frame, even when that input has nothing to send. The empty slot is still transmitted and discarded, so idle time is paid for at full link rate.", sec: "s8" },
    { q: "Explain multilevel multiplexing with an example.",
      a: "When one input's rate is an exact multiple of another's, give the fast input more bits per slot instead of more slots. Two 20 kbps inputs and one 40 kbps input produce a 4-bit frame at 20,000 frames/s = 80 kbps, matching 20 + 20 + 40.", sec: "s9" },
    { q: "Explain multiple-slot multiplexing.",
      a: "A high-rate input is allotted several slots in each frame; the slots need not be adjacent. Three inputs at 100, 200 and 400 bytes/s give 1 + 2 + 4 = 7 bytes per frame at 100 frames/s = 5600 bps.", sec: "s9" },
    { q: "What is pulse stuffing and why is it used?",
      a: "Pulse stuffing (bit padding) sets the frame rate from the highest-rate input and pads the slower inputs with dummy bits until their effective rate matches, so that mismatched inputs can share one synchronous frame. It costs efficiency but simplifies the receiver.", sec: "s9" },
    { q: "What is DS-0, and how is its 64 kbps derived?",
      a: "DS-0 is one digitised voice channel: 8000 samples per second, each quantised to 8 bits, giving 8000 × 8 = 64,000 bps = 64 kbps.", sec: "s10" },
    { q: "Derive the T-1 (DS-1) rate of 1.544 Mbps.",
      a: "A DS-1 frame carries 24 byte-slots plus 1 framing bit = 193 bits, and repeats 8000 times per second: 8000 × 193 = 1,544,000 bps = 1.544 Mbps. Equivalently 24 × 64 kbps + 8 kbps of framing.", sec: "s10" },
    { q: "What is statistical TDM, and what is its main source of efficiency?",
      a: "Statistical (asynchronous) TDM allocates slots dynamically, packing in only the channels that actually have data. Its efficiency comes from eliminating idle slots, at the cost of adding an address to each block and needing buffers for bursts.", sec: "s11" },
    { q: "Why does statistical TDM need addresses?",
      a: "Because slot position no longer identifies the channel — a channel appears in a frame only when it has data, so each block must carry an explicit address telling the demultiplexer where it belongs. Synchronous TDM needs no address because slot position is the address.", sec: "s11" },
    { q: "Compare synchronous and statistical TDM on overhead and predictability.",
      a: "Synchronous TDM pays for idle slots but is simple and has predictable delay; statistical TDM wastes no slots on idle channels but adds addressing overhead, needs buffering, and has delay and jitter that vary with load.", sec: "s12" },
    { q: "State the FDM-versus-TDM distinction in one sentence each.",
      a: "FDM is an analog technique that divides a link's bandwidth into frequency bands, one per channel, separated by guard bands. TDM is a digital technique that divides time into slots and gives each channel the whole bandwidth for its slot.", sec: "s12" },
    { q: "In the slide's slot comparison, what does synchronous TDM transmit that statistical TDM does not?",
      a: "Empty (idle) slots. With five lines A–E, synchronous TDM reserves a slot for each line every frame, including slots where a line had no data; statistical TDM packs only the available data, so the same information travels in fewer slots.", sec: "s12" },
    { q: "Ten terminals at 10 kbps, each busy 25 % of the time — what does each TDM variant need?",
      a: "Synchronous TDM needs 10 × 10 = 100 kbps. Statistical TDM faces an average load of 10 × 0.25 × 10 = 25 kbps, so a 75 kbps link with buffer headroom suffices — a 25 kbps saving.", sec: "s11" },
  ],
  quiz: [
    { q: "Bandwidth utilisation is the wise use of available bandwidth to achieve specific goals. Which pairing matches the slides?",
      choices: ["Efficiency by spreading; privacy by multiplexing", "Efficiency by multiplexing; privacy and anti-jamming by spreading", "Efficiency by both; privacy by neither", "Privacy by multiplexing; anti-jamming by FDM"],
      answer: 1,
      why: "The slides state exactly this: efficiency can be achieved by multiplexing, while privacy and anti-jamming can be achieved by spreading. Reversing the two is the standard distractor.", sec: "s1" },
    { q: "Which statement defines multiplexing?",
      choices: ["Converting analog signals to digital so several can share a link", "The simultaneous transmission of multiple signals across a single data link", "Encrypting several signals so they cannot be intercepted", "Sending one signal twice over two links for redundancy"],
      answer: 1,
      why: "Multiplexing is the set of techniques that allows the simultaneous transmission of multiple signals across a single data link. It is possible whenever the link's bandwidth exceeds the bandwidth needs of the devices.", sec: "s2" },
    { q: "FDM is best described as:",
      choices: ["A digital multiplexing technique that combines analog signals", "An analog multiplexing technique that combines analog signals", "An analog multiplexing technique that combines digital signals", "A spreading technique for privacy"],
      answer: 1,
      why: "The slide defines FDM as an analog multiplexing technique that combines analog signals. TDM is the digital multiplexing technique, and spreading is a separate family altogether.", sec: "s3" },
    { q: "Three 4 kHz voice channels are combined into a 12 kHz link from 20 to 32 kHz with no guard bands. Which assignment matches the slide's solution?",
      choices: ["20–24, 28–32, 36–40 kHz", "20–24, 24–28, 28–32 kHz", "20–28, 28–36, 36–44 kHz", "0–4, 4–8, 8–12 kHz"],
      answer: 1,
      why: "The slide shifts the three channels to 20–24, 24–28 and 28–32 kHz, tiling the whole 20–32 kHz range with no gap and no overlap; the other options either overflow the link or leave gaps.", sec: "s4" },
    { q: "A band runs from 100 kHz to 184 kHz. Each voice channel is 4 kHz wide and each guard band is 4 kHz. How many channels fit?",
      choices: ["21", "11", "10", "20"],
      answer: 1,
      why: "n channels with guards occupy 4n + 4(n − 1) = 8n − 4 kHz, and 8n − 4 ≤ 84 gives n ≤ 11. The popular 84/4 = 21 ignores guard bands entirely and is the trap answer.", sec: "s4" },
    { q: "In the classical FDM hierarchy, how many voice channels does a supergroup contain?",
      choices: ["12", "60", "600", "24"],
      answer: 1,
      why: "A group is 12 voice channels, a supergroup is 5 groups (5 × 12 = 60 channels), and a mastergroup is 10 supergroups (600 channels).", sec: "s5" },
    { q: "WDM is described on the slide as:",
      choices: ["A digital multiplexing technique to combine electrical signals", "An analog multiplexing technique to combine optical signals", "A technique for combining signals by time slots", "A spreading technique for optical fibre privacy"],
      answer: 1,
      why: "The slide's definition is that WDM is an analog multiplexing technique to combine optical signals — FDM applied to fibre, where channels differ by wavelength rather than by frequency.", sec: "s6" },
    { q: "TDM is defined in the slides as:",
      choices: ["A digital multiplexing technique for combining several low-rate channels into one high-rate one", "An analog technique for combining high-rate channels into low-rate ones", "A fibre-only technique for combining wavelengths", "A method of spreading a signal to hide it from eavesdroppers"],
      answer: 0,
      why: "The slide's wording is that TDM is a digital multiplexing technique for combining several low-rate channels into one high-rate one — the opposite direction from combining high-rate channels into low-rate ones.", sec: "s7" },
    { q: "In synchronous TDM, how do the link rate and the unit duration relate to the number of channels n?",
      choices: ["The link rate is n times slower and the unit duration n times longer", "The link rate is n times faster and the unit duration n times shorter", "The link rate is unchanged and only the duration changes", "The link rate is 1/n and the unit duration is unchanged"],
      answer: 1,
      why: "The slide states that in synchronous TDM the data rate of the link is n times faster and the unit duration is n times shorter, because the link must fit one unit from each of n channels into the time one unit would normally take.", sec: "s8" },
    { q: "Four channels are multiplexed with 1 byte per channel per frame, and each channel sends 100 bytes/s. What is the link bit rate?",
      choices: ["400 bps", "800 bps", "3200 bps", "32,000 bps"],
      answer: 2,
      why: "Each frame is 4 bytes = 32 bits and the frame rate is 100 frames/s, so 100 × 32 = 3200 bps. Equivalently 4 × 100 = 400 bytes/s = 3200 bps.", sec: "s8" },
    { q: "Following that same example, what is the frame duration?",
      choices: ["0.1 ms", "1 ms", "10 ms", "100 ms"],
      answer: 2,
      why: "Frame rate is 100 frames/s, so each frame lasts 1/100 s = 0.01 s = 10 ms, exactly as the slide states (frame duration = 1/100 s).", sec: "s8" },
    { q: "Which technique sets the frame rate from the highest-rate input and pads the slower inputs with dummy bits?",
      choices: ["Multilevel multiplexing", "Multiple-slot multiplexing", "Pulse stuffing", "Statistical TDM"],
      answer: 2,
      why: "Pulse stuffing (bit padding) makes the fastest input set the frame rate and fills the slower inputs with extra dummy bits so every slot is filled; multilevel and multiple-slot instead give fast inputs more bits or more slots.", sec: "s9" },
    { q: "A T-1 (DS-1) frame contains 24 voice channels and one framing bit. What is its rate?",
      choices: ["1.536 Mbps", "1.544 Mbps", "1.920 Mbps", "2.048 Mbps"],
      answer: 1,
      why: "Frame size is 24 × 8 + 1 = 193 bits and it repeats 8000 times per second, so 8000 × 193 = 1,544,000 bps = 1.544 Mbps. The 1.536 Mbps figure is the payload alone (24 × 64 kbps) with the framing bit left out.", sec: "s10" },
    { q: "What is the principal reason statistical TDM is more efficient than synchronous TDM?",
      choices: ["It uses higher voltage levels so bits travel faster", "It eliminates the idle slots that synchronous TDM transmits for inactive channels", "It compresses the data before multiplexing", "It requires no synchronisation at the receiver"],
      answer: 1,
      why: "Statistical TDM allocates slots dynamically, so only active channels appear in a frame; the empty slots that synchronous TDM must transmit for idle inputs — which carry no information — are simply not sent.", sec: "s11" },
    { q: "What price does statistical TDM pay for that efficiency?",
      choices: ["It cannot carry digital data", "Each block needs an address, and bursts require buffering", "It must use guard bands between channels", "It can only combine two channels at a time"],
      answer: 1,
      why: "Since slot position no longer identifies the source, each block carries an explicit address, which is pure overhead, and because the aggregate rate fluctuates the multiplexer must buffer bursts, adding delay and jitter.", sec: "s11" },
    { q: "Ten terminals run at 10 kbps each and are busy only 25 % of the time. How much link capacity does synchronous TDM require, and what would statistical TDM need on average?",
      choices: ["25 kbps and 10 kbps", "100 kbps and 25 kbps", "100 kbps and 100 kbps", "10 kbps and 2.5 kbps"],
      answer: 1,
      why: "Synchronous TDM must reserve a slot for every input, so it needs 10 × 10 = 100 kbps. Statistical TDM faces an average demand of 10 × 0.25 × 10 = 25 kbps, which is why it needs far less raw capacity.", sec: "s11" },
    { q: "Which comparison between FDM and TDM is correct?",
      choices: ["FDM divides time; TDM divides frequency", "FDM is analog and divides frequency; TDM is digital and divides time", "Both are digital techniques dividing the time axis", "FDM requires slots and TDM requires guard bands"],
      answer: 1,
      why: "FDM is an analog technique that gives each channel its own frequency band with guard bands between them; TDM is a digital technique that gives each channel the whole bandwidth for its own time slot.", sec: "s12" },
    { q: "In the slide's five-line comparison, what appears in the synchronous TDM frame but not in the statistical TDM frame?",
      choices: ["Address bytes for each channel", "Guard bands between slots", "Empty slots for lines with no data, plus stuffing slots", "A separate framing bit for every line"],
      answer: 2,
      why: "The synchronous frame reserves a slot for every line whether or not it has data, so it contains empty slots and a stuffing slot; statistical TDM packs only the available data, so the same information fits in fewer slots.", sec: "s12" },
  ],
});
