window.NSCOM_MODULES = window.NSCOM_MODULES || [];
window.NSCOM_MODULES.push({
  id: "m03",
  num: 3,
  title: "Physical Layer — Digital Transmission",
  accent: "#4fb3d9",
  icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12h2.5v-7h3.5v14h3.5v-14h3.5v14h3.5v-9h2.5"/></svg>`,
  summary:
    "Digital-to-digital conversion is the problem of turning a string of bits into a voltage waveform that the far end can recover. This module covers the whole line-coding toolbox: unipolar, polar (NRZ-L, NRZ-I, RZ, Manchester, differential Manchester), bipolar (AMI, pseudoternary) and multilevel schemes (2B1Q, 8B6T, 4D-PAM5, MLT-3); the design criteria those schemes trade against (baseline wandering, the DC component, self-synchronization, error detection, complexity); the data-rate/signal-rate relationship and the baud formula S = c × N × 1/r; block coding (4B/5B, 8B/10B) and scrambling (B8ZS, HDB3) as bandwidth-efficient ways to buy back synchronization; and finally analog-to-digital conversion by PCM — sampling under Nyquist, quantization with its error and SNR, and binary encoding — plus delta modulation, DPCM and the parallel/serial transmission modes.",
  sections: [
    {
      id: "s1",
      title: "What Digital-to-Digital Conversion Is",
      body: [
        {
          type: "fig",
          fig: "m03-p02-digital-to-digital-transmission",
          caption: "Digital data (a bit pattern) mapped onto a digital signal (a waveform).",
        },
        {
          type: "fig",
          fig: "m03-p04-line-coding-and-decoding",
          caption: "The encoder turns bits into a signal; the decoder turns the signal back into bits.",
        },
        {
          type: "list",
          items: [
            "**Digital-to-digital conversion** maps a bit stream onto a digital waveform with a few discrete levels.",
            "The receiver must be able to **sample** the waveform and recover the bits — that is the whole design problem.",
            "This is called **line coding**, and every scheme in this module is a different answer to it.",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "why line coding exists",
          body: [
            {
              type: "p",
              text: "Digital-to-digital conversion takes digital data — a string of bits — and represents it with a digital signal, a waveform whose amplitude takes only a small number of discrete values. The data itself is text, integers, images or audio that has already been reduced to bits; the signal is what actually travels down the wire. Converting one to the other is called line coding, and reversing it at the far end is line decoding.",
            },
            {
              type: "p",
              text: "Line coding is necessary because a channel cannot carry numbers, only physical quantities. A high voltage level (+V) might stand for a 1 and a low or zero level (0, or -V) for a 0, and the receiver samples the incoming waveform at each bit interval and decides which level it sees. Everything else in this module is a refinement of that single decision problem.",
            },
            {
              type: "p",
              text: "Two separate rate concepts fall straight out of the picture and are worth fixing in mind immediately, because nearly every design argument later compares them. The data rate, or bit rate, is how many bits per second the transmitter consumes in bits (bps). The signal rate, or baud rate, is how many signal elements per second the wire actually sees. A scheme is efficient when the same data rate is carried at a lower signal rate, because fewer signal elements per second means a narrower bandwidth requirement.",
            },
            {
              type: "list",
              items: [
                "Encoder: bits → voltage levels laid out on a time grid of bit intervals.",
                "Decoder: samples each bit interval, compares the sample to a threshold, outputs a bit.",
                "Design goal: high bit rate, low baud rate, plus synchronization and no DC drift.",
              ],
            },
          ],
        },
      ],
    },
    {
      id: "s2",
      title: "Data Elements, Signal Elements and the Ratio r",
      body: [
        {
          type: "fig",
          fig: "m03-p05-mapping-data-symbols-onto-signal-lev",
          caption: "One data symbol can be coded into one signal element or into several.",
        },
        {
          type: "fig",
          fig: "m03-p07-signal-element-versus-data-element",
          caption: "One signal element can span several data elements, or one data element can require several signal elements.",
        },
        {
          type: "list",
          items: [
            "A **data element** is the smallest unit of information (a bit, or a group of bits).",
            "A **signal element** is the shortest unit of the waveform occupying one time slot.",
            "**r** = how many data elements ride on one signal element. r = 1 means one bit per pulse; r = 2 means two.",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "r and what it controls",
          body: [
            {
              type: "p",
              text: "A data element is the smallest unit that carries information — one bit, or a fixed group of bits such as the pairs 11, 10, 01, 00. A signal element is the smallest unit of the carrier waveform that occupies one slot on the time axis. Line coding is exactly the business of mapping one onto the other, and the mapping can be one-to-one or many-to-one.",
            },
            {
              type: "list",
              items: [
                "One data element → one signal element: the bit 1 becomes +V, the bit 0 becomes -V.",
                "One data element → two signal elements: the bit 1 is rendered as the pair +V, -V and the bit 0 as -V, +V — this is Manchester coding.",
                "One data element → four signal elements, or three data elements → two signal elements: the basis of multilevel and 4D codes.",
              ],
            },
            {
              type: "p",
              text: "The ratio r is defined as the number of data elements carried by one signal element. If one signal element carries one bit, r = 1. If one signal element carries two bits — as in 2B1Q, where each pulse carries a two-bit symbol — then r = 2 and the signal rate is half the bit rate. If one bit is spread over two signal elements, as in Manchester, then r = 1/2 and the required signalling rate doubles.",
            },
            {
              type: "formula",
              tex: "r = \\dfrac{\\text{number of data elements}}{\\text{number of signal elements}}",
              text: "r is the number of data elements carried by one signal element: r = 1 means one bit per signal element, r = 2 means two bits per signal element (fewer signal elements needed), and r = 1/2 means half a bit per signal element (twice as many signal elements needed).",
            },
            {
              type: "example",
              text: "Two schemes carry the same 10 kbps bit stream. Scheme A has r = 1, so it needs 10,000 signal elements per second. Scheme B packs 2 bits into each symbol (r = 2), so the same data moves in only 5,000 signal elements per second — half the signalling rate. If a third scheme is Manchester (r = 1/2), it needs 20,000 signal elements per second.",
              steps: [
                "Scheme A: N = 10,000 bps, r = 1 → one signal element per bit.",
                "Scheme B: r = 2 → each signal element carries two bits → 10,000/2 = 5,000 signal elements/s.",
                "Manchester: r = 1/2 → each bit needs two signal elements → 10,000 × 2 = 20,000 signal elements/s.",
              ],
            },
            {
              type: "note",
              text: "Keep the direction of r straight: a bigger r means each signal element works harder, so you need fewer of them. Packing more bits per symbol lowers the signalling rate but raises the number of voltage levels the receiver must distinguish, which costs noise margin.",
            },
          ],
        },
      ],
    },
    {
      id: "s3",
      title: "Data Rate, Signal Rate and the Baud Formula",
      body: [
        {
          type: "fig",
          fig: "m03-p08-data-rate-and-baud-rate",
          caption: "The slide's statement of the baud-rate formula.",
        },
        {
          type: "list",
          items: [
            "**Data rate N** = bits per second (bps). **Signal rate S** = signal elements per second (**baud**).",
            "They relate by **S = N × (1/r)** — pack more bits per symbol and the baud rate drops.",
            "**Lower baud rate = lower bandwidth needed.** That is the entire economics of line coding.",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "baud vs bit rate",
          body: [
            {
              type: "p",
              text: "The data rate N defines the number of bits sent per second and is measured in bits per second; it is also called the bit rate. The signal rate S is the number of signal elements sent in one second and is measured in bauds; it is also called the modulation rate or baud rate. The two are related through r and a case factor c that absorbs how favourable the bit pattern happens to be.",
            },
            {
              type: "formula",
              tex: "S = c \\times N \\times \\dfrac{1}{r}\\ \\text{bauds}",
              text: "The signal rate (bauds) equals the case factor c times the data rate N in bits per second, divided by r — that is, times 1/r. Dividing by r means the more bits each signal element carries, the lower the signalling rate.",
            },
            {
              type: "list",
              items: [
                "c = 1 is the worst case: the data pattern forces the maximum number of signal elements.",
                "c = 1/2 is the average case, used when the bit pattern is assumed to be equally likely to trigger or skip a transition.",
                "c = 0 is the best case: a long run of identical bits produces no signal elements at all.",
              ],
            },
            {
              type: "p",
              text: "The goal stated on the slides is to increase the data rate while reducing the baud rate. That is the whole economics of line coding: a lower baud rate means a lower minimum bandwidth, so either the same wire carries more bits or the same bits travel down a cheaper wire. Multilevel coding buys this by raising r; Manchester and RZ pay it back by lowering r.",
            },
            {
              type: "example",
              text: "A signal carries data with one data element per signal element, so r = 1. The bit rate is 100 kbps. What is the average baud rate if c ranges between 0 and 1?",
              steps: [
                "Write the formula: S = c × N × 1/r.",
                "Substituting the average case c = 1/2: S = (1/2) × 100,000 × 1.",
                "S = 50,000 baud — average signal rate.",
                "The worst case c = 1 would give 100,000 baud; the best case c = 0 would give 0 baud.",
              ],
            },
            {
              type: "p",
              text: "It is worth separating the definition from the deployment. Designers of a physical layer do not get to choose the bit pattern, so the honest design number is the worst case, c = 1, or the average, c = 1/2; the best case c = 0 never survives contact with real data. Textbook answers in this course routinely quote the average case, and that convention needs to be stated explicitly in any answer you write.",
            },
            {
              type: "example",
              text: "A second, independent check of the same formula with a different r. Suppose a scheme packs 2 bits per signal element (r = 2) and the data rate is 100 kbps. Using the average case, S = (1/2) × 100,000 × (1/2) = 25,000 baud — one quarter of the bit rate, exactly what you would expect from two bits per element plus a factor of one half for the average pattern.",
              steps: [
                "Recognise r = 2.",
                "S = c × N × 1/r = 0.5 × 100,000 × 0.5.",
                "S = 25,000 baud.",
                "Sanity check: the worst case with r = 2 is 50,000 baud, and with r = 1 it would be 100,000 baud, so the ordering is correct.",
              ],
            },
          ],
        },
      ],
    },
    {
      id: "s4",
      title: "Bandwidth of a Digital Signal and the Nyquist Limit",
      body: [
        {
          type: "fig",
          fig: "m03-p10-note-on-bandwidth-with-digital-signa",
          caption: "The slide's statement that effective bandwidth is finite while actual bandwidth is infinite.",
        },
        {
          type: "list",
          items: [
            "A perfect digital edge needs **infinite bandwidth** — it changes instantly, which costs every frequency.",
            "Real channels are band-limited, so the edges round off and the signal becomes effectively analog.",
            "**Nyquist limit: N = 2 × B × log₂L** — the hard ceiling on how fast you can send distinct levels through bandwidth B.",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "why edges cost bandwidth",
          body: [
            {
              type: "p",
              text: "A digital signal built from instantaneous level changes has, in strict theory, an infinite bandwidth requirement: a perfect step edge contains energy at every frequency. In practice the effective bandwidth is finite, because the receiver only needs enough of the spectrum to decide each bit, and the channel simply refuses to pass the rest. Cables therefore behave as low-pass filters that round off the edges, and the designer's job is to keep the resulting intersymbol interference under control.",
            },
            {
              type: "formula",
              tex: "N_{max} = 2 \\times B \\times \\log_2 L",
              text: "Nyquist's maximum data rate: in a noiseless channel, at most two times the bandwidth times the base-2 logarithm of the number of signal levels, in bits per second.",
            },
            {
              type: "p",
              text: "The Nyquist limit above is not about noise; it is the hard ceiling on how fast distinct levels can be sent through a channel of a given bandwidth. Doubling B doubles the achievable rate, and each doubling of the number of levels L adds exactly one bit per hertz of bandwidth because log2 L counts the bits per level. Nyquist tells you how fast; Shannon's noisy-channel capacity, which also involves the signal-to-noise ratio, tells you the practical ceiling once noise is present.",
            },
            {
              type: "example",
              text: "A noiseless channel has a bandwidth of 3 kHz and the transmitter can create four distinct voltage levels. Using Nyquist: N_max = 2 × 3,000 × log2 4 = 2 × 3,000 × 2 = 12,000 bps. Raising the levels from 4 to 8 keeps the bandwidth at 3 kHz but raises the ceiling to 2 × 3,000 × 3 = 18,000 bps — one extra bit per hertz.",
              steps: [
                "L = 4 → log2 4 = 2 bits per signal element.",
                "N_max = 2 × B × log2 L = 2 × 3,000 × 2 = 12,000 bps.",
                "L = 8 → log2 8 = 3 → N_max = 2 × 3,000 × 3 = 18,000 bps.",
              ],
            },
            {
              type: "note",
              text: "A useful rule of thumb that follows from Nyquist is B_min = N / (2 log2 L) for a noiseless channel, and for two-level NRZ, B_min = N/2. The 500 kHz answer derived earlier from the average baud rate is exactly this formula, which is the consistency check examiners expect you to notice.",
            },
          ],
        },
      ],
    },
    {
      id: "s5",
      title: "The Five Design Criteria for Line Encoding",
      body: [
        {
          type: "fig",
          fig: "m03-p11-considerations-for-choosing-a-good-s",
          caption: "Long runs of fixed amplitude cause the baseline to wander away from its true value.",
        },
        {
          type: "fig",
          fig: "m03-p12-line-encoding-dc-components",
          caption: "A constant level produces a large DC component that a bandpass channel will not carry.",
        },
        {
          type: "fig",
          fig: "m03-p13-line-encoding-self-synchronization",
          caption: "Effects of the receiver clock running faster than the sender clock.",
        },
        {
          type: "fig",
          fig: "m03-p15-line-encoding-error-detection",
          caption: "A transition that is not part of the code signals a symbol error to the receiver.",
        },
        {
          type: "list",
          items: [
            "Five criteria decide whether a line code is any good: **baseline wandering, DC components, synchronization, error detection, noise immunity**.",
            "**Baseline wandering**: a long run of identical bits drifts the receiver's reference and it starts misreading.",
            "**Self-synchronization**: the code must produce enough transitions for the receiver's clock to stay locked.",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "scoring a scheme",
          body: [
            {
              type: "p",
              text: "Choosing a line code is not about picking whichever shape looks tidy. The slides name a set of competing considerations that decide the matter, and almost every scheme that follows can be scored on them: preventing long runs of fixed amplitude to control baseline wandering, eliminating DC components, achieving self-synchronization, gaining error detection, and staying simple enough to build cheaply.",
            },
            {
              type: "h3",
              text: "Baseline wandering",
            },
            {
              type: "p",
              text: "When a receiver decodes a digital signal it computes a running average of the received signal power and uses that running average, called the baseline, as the reference against which it compares each incoming sample. A long string of 0s or 1s has no transitions and drags the baseline up or down, so later samples are measured against the wrong reference and the decoder starts producing the wrong bits. This drift is the baseline wandering that the slides specifically warn against.",
            },
            {
              type: "h3",
              text: "DC components",
            },
            {
              type: "p",
              text: "When the voltage level stays constant for long periods, the signal acquires energy at very low frequencies — a DC component. Most real channels are bandpass: transformers, capacitive coupling and the line itself refuse to pass those low frequencies, so the DC content is stripped out and the waveform is distorted at the receiver. Removing or minimising the DC component is therefore a design requirement, not an aesthetic one.",
            },
            {
              type: "h3",
              text: "Self-synchronization",
            },
            {
              type: "p",
              text: "Sender and receiver clocks must agree on where each bit interval begins and ends. If the receiver clock runs faster or slower, the sampling instants slide and the incoming bit stream is misread — the classic symptom is a burst of wrong bits that begins part way through a long run. Transitions in the received signal give the receiver something to lock onto, so a code that guarantees frequent transitions is called self-synchronizing.",
            },
            {
              type: "example",
              text: "In a digital transmission the receiver clock is 0.1 percent faster than the sender's. How many extra bits per second does the receiver recover at 1 kbps, and at 1 Mbps?",
              steps: [
                "A 0.1 percent error means the receiver counts bits at 1.001 times the transmitter's rate.",
                "At 1 kbps: 1,000 × 1.001 = 1,001 bps, so the receiver gains 1 extra bit per second.",
                "At 1 Mbps: 1,000,000 × 1.001 = 1,001,000 bps, so the receiver gains 1,000 extra bits per second.",
                "The lesson is that a fixed fractional clock error scales with the data rate: the same 0.1 percent becomes catastrophic at high rates.",
              ],
            },
            {
              type: "p",
              text: "Two further criteria round out the list. Error detection is a bonus some codes give for free: if the code forbids certain signal shapes, then observing a forbidden shape tells the receiver a symbol error has occurred (a violation on an AMI line is the canonical example). Noise and interference immunity is a stronger property than detection — certain schemes are designed so that a corrupted symbol is hard to mistake for a legitimate one.",
            },
            {
              type: "p",
              text: "The last criterion is complexity, and it is the one that keeps the whole design space honest. A more robust and resilient code is more complex to implement, and the price is usually paid either in a higher baud rate or in required bandwidth. The recurring trade in this module is therefore: transition density buys synchronization, transition density costs bandwidth.",
            },
            {
              type: "note",
              text: "Memory anchor for the criteria: wandering, DC, sync, detect, cost. Any scheme's weaknesses can be phrased against those five words, and most exam answers are just three of them restated.",
            },
          ],
        },
      ],
    },
    {
      id: "s6",
      title: "Unipolar and Polar NRZ Schemes",
      body: [
        {
          type: "fig",
          fig: "m03-p18-line-coding-schemes",
          caption: "The family tree of line coding schemes.",
        },
        {
          type: "fig",
          fig: "m03-p21-unipolar-nrz-scheme",
          caption: "Unipolar NRZ: a positive level for 1, zero for 0, all above the time axis.",
        },
        {
          type: "fig",
          fig: "m03-p23-polar-nrz-l-and-nrz-i-schemes",
          caption: "NRZ-L encodes the level; NRZ-I encodes the transition at the start of the bit.",
        },
        {
          type: "fig",
          fig: "m03-p24-note-on-nrz-schemes",
          caption: "The slide's own summary of NRZ-L versus NRZ-I.",
        },
        {
          type: "list",
          items: [
            "**Unipolar** uses one polarity only (0 and +V) — simple, but it has a **DC component** and no sync on long runs.",
            "**Polar** uses both sides of the axis (+V and −V), which cancels the DC problem.",
            "**NRZ** (Non-Return-to-Zero) keeps the level for the whole symbol — efficient, but bad on runs of identical bits.",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "when NRZ breaks down",
          body: [
            {
              type: "p",
              text: "Line coding schemes are grouped by how many voltage levels they use and on which side of the time axis those levels sit. Unipolar uses levels on only one side of the axis; polar uses both sides; bipolar uses three levels with one of them at zero; multilevel uses more than two levels to carry more than one bit at a time.",
            },
            {
              type: "h3",
              text: "Unipolar NRZ",
            },
            {
              type: "p",
              text: "The unipolar scheme keeps every signal level on one side of the time axis, either all above or all below. Its canonical form is Non-Return-to-Zero: the level does not return to zero within a symbol interval, so a run of identical bits produces a flat line. It is prone to baseline wandering and carries a large DC component, has no self-synchronization and no error detection, and although it is simple to build it wastes power because the average level is never zero.",
            },
            {
              type: "h3",
              text: "Polar NRZ-L and NRZ-I",
            },
            {
              type: "p",
              text: "Polar schemes put their voltage levels on both sides of the time axis, typically +V for a 1 and -V for a 0. There are two families. In NRZ-Level the level itself carries the value: positive voltage for one symbol, negative for the other. In NRZ-Inversion the level is irrelevant and the meaning lives in the transitions: a 1 inverts the polarity, a 0 does not.",
            },
            {
              type: "table",
              head: ["Property", "NRZ-L", "NRZ-I"],
              rows: [
                ["What encodes the bit", "The voltage level itself", "The presence or absence of a transition"],
                ["1 bit", "+V", "Invert the current level"],
                ["0 bit", "-V", "Keep the current level"],
                ["Average signal rate", "N/2 baud", "N/2 baud"],
                ["DC component", "Large", "Smaller, but present"],
                ["Baseline wandering", "Worse", "Less bad"],
                ["Self-synchronization", "None", "None"],
                ["Error detection", "None", "None"],
                ["Implementation", "Simple", "Simple"],
              ],
            },
            {
              type: "p",
              text: "Both schemes share an average signal rate of N/2 baud because the average case factor is one half for each: NRZ-L alternates level about half the time, and NRZ-I inverts on roughly half the bits. Both suffer a DC component and baseline wandering, with NRZ-I the better of the two because a long run of 1s still produces transitions; a long run of 0s defeats it just as thoroughly. Neither is self-synchronizing and neither can detect errors.",
            },
            {
              type: "p",
              text: "The additive depth worth holding onto is why NRZ-I is preferable in practice. A long run of 1s in NRZ-L is a DC level and nothing else, so the receiver's clock has no edge to correct against and the baseline drifts. In NRZ-I the same long run of 1s alternates the polarity at every bit, so the receiver receives a square wave at half the bit rate and can recover timing from it. Runs of 0s remain the shared weakness — which is precisely the problem that AMI and the scramblers in the next sections are built to attack.",
            },
            {
              type: "example",
              text: "A system uses NRZ-I to transfer 1 Mbps. What are the average signal rate and the minimum bandwidth?",
              steps: [
                "Identify the parameters: N = 1,000,000 bps, r = 1, and use the average case c = 1/2.",
                "Apply the formula: S = c × N × 1/r = (1/2) × 1,000,000 × 1 = 500,000 baud.",
                "For NRZ coding the minimum bandwidth equals the signal rate: B_min = S = 500,000 Hz = 500 kHz.",
                "Consistency check with Nyquist: B_min = N / (2 log2 L) with L = 2 gives 1,000,000/2 = 500 kHz — the same answer by two routes.",
              ],
            },
          ],
        },
      ],
    },
    {
      id: "s7",
      title: "Polar RZ and Biphase: Manchester and Differential Manchester",
      body: [
        {
          type: "fig",
          fig: "m03-p27-polar-rz-scheme",
          caption: "Polar RZ: the level always returns to zero half way through each symbol.",
        },
        {
          type: "fig",
          fig: "m03-p29-polar-biphase-manchester-and",
          caption: "Manchester and differential Manchester waveforms.",
        },
        {
          type: "list",
          items: [
            "**Polar RZ** forces a transition in the middle of every symbol, returning to zero each time.",
            "**Manchester** forces a mid-symbol transition *and* uses it to encode the bit — so it is always self-synchronizing.",
            "**Differential Manchester** puts the bit in the *presence or absence* of a transition at the symbol start, not the level itself.",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "how Manchester syncs",
          body: [
            {
              type: "h3",
              text: "Polar RZ",
            },
            {
              type: "p",
              text: "The Return-to-Zero scheme fixes the DC problem by using three voltage values, +, 0 and -, and by forcing a transition in the middle of every symbol: a 1 runs high in the first half and drops to zero in the second, a 0 runs low and rises to zero. Every symbol therefore contains two signal transitions, which is the source of both its virtue and its cost.",
            },
            {
              type: "list",
              items: [
                "Advantage: no DC component and no baseline wandering, because the level returns to zero every symbol.",
                "Advantage: self-synchronizing, since the mid-symbol transition marks every symbol boundary.",
                "Disadvantage: two signal transitions per symbol means twice the baud rate, so a wider bandwidth is required.",
                "Disadvantage: three voltage levels make the transmitter and receiver more complex, and it still has no error detection.",
              ],
            },
            {
              type: "formula",
              tex: "r = \\tfrac{1}{2} \\quad\\Rightarrow\\quad S_{worst} = 2N \\ \\text{bauds}",
              text: "Because each bit is carried by two signal elements, r is one half; in the worst case the signal rate is twice the data rate.",
            },
            {
              type: "h3",
              text: "Manchester coding",
            },
            {
              type: "p",
              text: "Manchester coding is the combination of NRZ-L's two level values with RZ's guaranteed mid-symbol transition. Every symbol has a level transition in the middle of the bit — high to low, or low to high — and only two voltage levels are ever used, unlike RZ's three. The direction of the mid-bit transition carries the data; the transition itself supplies the clock recovery.",
            },
            {
              type: "h3",
              text: "Differential Manchester",
            },
            {
              type: "p",
              text: "Differential Manchester is the combination of NRZ-I's differential idea with RZ's forced transition. The mid-symbol transition is always present and is used only for synchronization; the value of the bit is carried by what happens at the start of the symbol — one symbol causes a level change at the boundary, the other does not. Because the bit is encoded as a change rather than a level, a cable that has been reversed or inverted at some point in the link does not corrupt the data.",
            },
            {
              type: "table",
              head: ["Property", "Manchester", "Differential Manchester"],
              rows: [
                ["Composition", "NRZ-L + RZ", "NRZ-I + RZ"],
                ["Mid-bit transition", "Always present, carries data", "Always present, for sync only"],
                ["Bit value carried by", "Direction of the mid-bit transition", "Presence/absence of a transition at the start"],
                ["Voltage levels", "Two", "Two"],
                ["Minimum bandwidth", "2 × NRZ", "2 × NRZ"],
                ["DC component", "None", "None"],
                ["Baseline wandering", "None", "None"],
                ["Self-synchronization", "Yes", "Yes"],
                ["Error detection", "None", "None"],
              ],
            },
            {
              type: "p",
              text: "The slides give the headline cost plainly: the minimum bandwidth of Manchester and differential Manchester is twice that of NRZ. That follows directly from the average signal rate. With r = 1/2, S = c × N × 1/r = (1/2) × N × 2 = N baud on average and 2N baud in the worst case, whereas NRZ averages N/2 baud. The transition density that makes these codes self-synchronizing and DC-free is paid for in bandwidth, one of the recurring trades in this module.",
            },
            {
              type: "example",
              text: "A 1 Mbps data stream is sent using Manchester coding. What is the average signal rate, the worst-case signal rate and the minimum bandwidth?",
              steps: [
                "Manchester has r = 1/2, so 1/r = 2.",
                "Average case: S = (1/2) × 1,000,000 × 2 = 1,000,000 baud.",
                "Worst case c = 1: S = 2,000,000 baud.",
                "Minimum bandwidth B_min = S, so 1 MHz on average and up to 2 MHz worst case — exactly double the 500 kHz that plain NRZ would need.",
              ],
            },
            {
              type: "note",
              text: "Manchester is what classic 10 Mbps Ethernet used, precisely because its guaranteed mid-bit transition made clock recovery from the data stream effortless, and the doubled bandwidth was affordable on coax and twisted pair at that rate.",
            },
          ],
        },
      ],
    },
    {
      id: "s8",
      title: "Bipolar AMI and Pseudoternary",
      body: [
        {
          type: "fig",
          fig: "m03-p32-bipolar-schemes-ami-and-pseudoternar",
          caption: "AMI and pseudoternary: the alternating pulses are the marks, and the zero level is the other symbol.",
        },
        {
          type: "fig",
          fig: "m03-p31-bipolar-ami-and-pseudoternary",
          caption: "The slide's definition of the two bipolar schemes.",
        },
        {
          type: "list",
          items: [
            "**Bipolar** uses three levels: +V, 0 and −V, with 0 representing one of the symbols outright.",
            "**AMI (Alternate Mark Inversion)**: 0 → zero volts; each successive 1 alternates between +V and −V.",
            "**Pseudoternary** is the mirror image: 1 → zero volts; the 0s alternate.",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "AMI worked through",
          body: [
            {
              type: "p",
              text: "Bipolar coding uses three voltage levels — +, 0 and - — but not in the RZ sense of always returning to zero. Here the zero level represents one of the two symbols outright, and the other symbol is represented by alternating between +V and -V. The alternation is what removes the DC component, because positive and negative pulses cancel each other over any even-length run.",
            },
            {
              type: "list",
              items: [
                "Bipolar AMI (Alternate Mark Inversion): the 0 symbol is zero voltage, and each successive 1 alternates between +V and -V.",
                "Pseudoternary: the exact reverse — the 1 symbol is zero voltage and the 0 symbol alternates between +V and -V.",
              ],
            },
            {
              type: "p",
              text: "The advantages are real. AMI is a better alternative to NRZ because it has no DC component and no baseline wandering: consecutive marks alternate polarity, so the running average of the signal stays near zero over long stretches. It also has a form of error detection built into the rule — two consecutive marks of the same polarity violate the alternation rule, and the receiver can flag that as a line violation without any extra bits.",
            },
            {
              type: "p",
              text: "The weakness is equally clear. Because the zero symbol is encoded as silence, a long run of 0s produces no transitions at all, so AMI has no self-synchronization in the presence of long zero runs. That single flaw is what the scrambling techniques of B8ZS and HDB3 exist to patch, and it is also why AMI is used as the underlying line code in North American DS1 and Japanese J1 carriers while HDB3 does the same job in European E-carrier systems.",
            },
            {
              type: "table",
              head: ["Criterion", "AMI / Pseudoternary"],
              rows: [
                ["DC component", "None"],
                ["Baseline wandering", "None"],
                ["Self-synchronization", "No — long runs of the zero symbol produce no transitions"],
                ["Error detection", "Partial — a same-polarity pair of marks is a detectable violation"],
                ["Complexity", "Greater than NRZ, because of the alternation logic"],
              ],
            },
            {
              type: "example",
              text: "Encode the bit sequence 1 0 1 1 0 1 1 using AMI, starting from a positive pulse for the first mark.",
              steps: [
                "Bit 1: first mark, take +. Signal: +.",
                "Bit 0: zero symbol, output 0. Signal: 0.",
                "Bit 1: second mark, alternate to -. Signal: -.",
                "Bit 1: third mark, alternate to +. Signal: +.",
                "Bit 0: zero symbol, output 0. Signal: 0.",
                "Bit 1: fourth mark, alternate to -. Signal: -.",
                "Bit 1: fifth mark, alternate to +. Signal: +.",
                "Resulting levels: +, 0, -, +, 0, -, +. Note the marks strictly alternate, which is the rule the receiver checks.",
              ],
            },
          ],
        },
      ],
    },
    {
      id: "s9",
      title: "Multilevel Schemes and Redundancy",
      body: [
        {
          type: "fig",
          fig: "m03-p35-code",
          caption: "Exact mapping versus redundant mapping: extra signals are what enable error detection.",
        },
        {
          type: "fig",
          fig: "m03-p38-multilevel-2b1q-scheme",
          caption: "2B1Q: four levels, two bits per signal element, no redundancy.",
        },
        {
          type: "fig",
          fig: "m03-p39-redundancy",
          caption: "Only one polarity of each pattern is used, and the inverted form is recognised and corrected at the receiver.",
        },
        {
          type: "fig",
          fig: "m03-p40-multilevel-8b6t-scheme",
          caption: "8B6T: eight bits in, six ternary symbol slots out, with a large DC-free codebook.",
        },
        {
          type: "fig",
          fig: "m03-p42-multilevel-4d-pam5-scheme",
          caption: "4D-PAM5: four links, PAM with five levels, 125 Mbaud per pair.",
        },
        {
          type: "list",
          items: [
            "**Multilevel** schemes pack **more bits per signal element** so fewer symbols are needed — the opposite strategy to forcing transitions.",
            "The bookkeeping: **2^m ≥ L^n** for the mapping to be possible. If **2^m = L^n** it's exact; if greater, there's **redundancy**.",
            "**2B1Q** is the standard example: 2 bits → 1 quaternary symbol, halving the baud rate.",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "the redundancy maths",
          body: [
            {
              type: "p",
              text: "Multilevel schemes attack the baud rate from the other direction: instead of forcing more transitions, they pack more bits into each signal element so fewer signal elements are needed for the same data. Because the data is binary there are only two data elements, 1 and 0; grouping m of them gives 2^m possible data symbols. If the line has L signal levels and each symbol uses n signal elements, there are L^n possible signal patterns to map them onto.",
            },
            {
              type: "formula",
              tex: "2^{m} \\le L^{n}",
              text: "In an mBnL scheme, a pattern of m data elements is encoded as a pattern of n signal elements where the number of possible data patterns, 2 to the m, must not exceed the number of possible signal patterns, L to the n.",
            },
            {
              type: "p",
              text: "The relationship between the two counts tells you what kind of code you have. If 2^m > L^n there are not enough distinct signals to represent the data, so the scheme is impossible. If 2^m = L^n the mapping is exact and nothing is wasted, but there is also no spare capacity for error detection. If 2^m < L^n there are more signals than symbols, and the designer can deliberately choose signal patterns that are far apart from one another, buying noise immunity and error detection because the unused patterns are illegal and their appearance signals a fault.",
            },
            {
              type: "p",
              text: "The notation mBnL encodes the whole recipe: m is the length of the binary data pattern, B says the pattern is binary, n is the length of the signal pattern, and L gives the number of levels using B for binary, T for ternary (3 levels) and Q for quaternary (4 levels). Thus 2B1Q means two binary bits mapped onto one quaternary signal element, and 8B6T means eight binary bits mapped onto six ternary signal elements.",
            },
            {
              type: "table",
              head: ["Scheme", "m", "n", "Levels L", "Pattern count 2^m", "Signal count L^n", "Verdict"],
              rows: [
                ["2B1Q", "2", "1", "4 (Q)", "4", "4", "Exact — no redundancy"],
                ["8B6T", "8", "6", "3 (T)", "256", "729", "Redundant — 473 unused patterns"],
                ["4B3T", "4", "3", "3 (T)", "16", "27", "Redundant — 11 unused patterns"],
              ],
            },
            {
              type: "h3",
              text: "2B1Q",
            },
            {
              type: "p",
              text: "In 2B1Q two binary bits are mapped onto a single signal element with four possible levels, which is why the mapping is exact: four patterns onto four levels. The bit rate is halved to get the baud rate, so a 160 kbps stream needs only 80 kbaud. The catch, as the slides note, is that with no redundancy the code can easily acquire a DC component: certain bit patterns map onto unequal numbers of positive and negative levels, and nothing in the scheme prevents that.",
            },
            {
              type: "h3",
              text: "Redundancy as a design tool",
            },
            {
              type: "p",
              text: "Redundancy — using fewer patterns than the line can physically represent — is what lets a code control its own DC balance. The technique described in the slides is polarity inversion: constrain the codebook so that every legal signal pattern is weighted, meaning it contains more + pulses than - pulses, and whenever a pattern would be generated that produces an imbalance, transmit its inverted twin instead. The receiver recognises the inverted pattern because it is not a legal code word, and inverts it back. The worked instance on the slide is the pattern +00++- being replaced by -00--+.",
            },
            {
              type: "example",
              text: "Count the balance of the two patterns from the slide to see why the trick works. +00++- has three positive pulses (+, +, +) and one negative (-), a net weight of +2. Its inverted twin -00--+ has three negatives and one positive, a net weight of -2. Because the two are exact opposites, transmitting whichever one keeps the running sum closer to zero bounds the DC component, and the receiver's knowledge that only one of the two forms is legal lets it undo the substitution.",
              steps: [
                "Original pattern: +, 0, 0, +, +, - → positives = 3, negatives = 1, weight = +3 - 1 = +2.",
                "Inverted pattern: -, 0, 0, -, -, + → positives = 1, negatives = 3, weight = +1 - 3 = -2.",
                "The two weights sum to zero, so either one cancels the other's DC contribution.",
                "The receiver sees a negative-weighted pattern, knows it is not a valid code word, and inverts it to recover the data.",
              ],
            },
            {
              type: "h3",
              text: "8B6T",
            },
            {
              type: "p",
              text: "8B6T maps eight binary bits onto six ternary signal elements. The channel count is 3^6 = 729 patterns for 2^8 = 256 data symbols, so 473 patterns are left over. That large margin is what allows the codebook to be chosen so that every usable pattern is DC-balanced, and the extra signal elements mean the signal rate is actually lower than the bit rate: six signal elements carry eight bits, so the signalling rate is 6/8 = 0.75 of the bit rate.",
            },
            {
              type: "example",
              text: "A 100 Mbps stream is sent using 8B6T. What is the signalling rate?",
              steps: [
                "8 bits are carried by 6 signal elements, so r = 8/6 = 4/3.",
                "S = c × N × 1/r; taking the worst case c = 1 gives S = 100,000,000 × 6/8.",
                "S = 75,000,000 baud = 75 Mbaud.",
                "The signalling rate is lower than the bit rate, which is the payoff of packing 1.33 bits into each ternary symbol.",
              ],
            },
            {
              type: "h3",
              text: "Multilevel using multiple channels",
            },
            {
              type: "p",
              text: "Another route to a lower signalling rate is to split the transmission across several physical links and send the segments simultaneously. Each link then carries only a fraction of the symbols per second, so each link needs a lower bandwidth — at the cost of requiring all the bits of a code word to be buffered before transmission can begin. The notation is xD-YYYz, where x is the number of parallel links, YYY names the modulation type such as PAM for pulse amplitude modulation, and z gives the number of levels. So 4D-PAM5 means four links carrying PAM with five levels.",
            },
            {
              type: "p",
              text: "4D-PAM5 is the gigabit Ethernet scheme: four twisted pairs, each carrying a five-level PAM signal, with a twenty-fifth symbol used for control including error detection. Each pair runs at 125 Mbaud, and four pairs times 2 bits per symbol gives the familiar 1 Gbps. The multiple-channel idea is therefore a bandwidth-reduction strategy implemented in copper rather than in the codebook.",
            },
          ],
        },
      ],
    },
    {
      id: "s10",
      title: "Multi-Transition Coding and MLT-3",
      body: [
        {
          type: "fig",
          fig: "m03-p44-multi-transition-mlt-3-scheme",
          caption: "MLT-3: the signal cycles through three levels and never dwells on one.",
        },
        {
          type: "fig",
          fig: "m03-p45-mlt-3",
          caption: "A run of 1s in MLT-3 creates a periodic signal at one quarter the bit rate.",
        },
        {
          type: "fig",
          fig: "m03-p46-summary-of-line-coding-schemes",
          caption: "The slide's own summary table of the line coding schemes.",
        },
        {
          type: "list",
          items: [
            "**Multi-transition** codes force transitions purely to guarantee synchronization, not to carry data.",
            "**MLT-3** uses +, 0, − and cycles levels on each 1, holding steady on every 0.",
            "Its win: **same signal rate as NRZ-I** without Manchester's bandwidth penalty.",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "why MLT-3 wins",
          body: [
            {
              type: "p",
              text: "The final family of line codes forces transitions not to add information but to guarantee synchronization. The problem is that forcing transitions can push the bandwidth requirement very high — Manchester, for instance, generates more transitions than there are bits because of its mid-bit flip, and it doubles the required bandwidth. Multi-transition codes seek a middle ground: they make the code differential at the bit level so that transitions appear at bit boundaries, keeping the bandwidth requirement close to the bit rate rather than twice it.",
            },
            {
              type: "p",
              text: "MLT-3 is the standard instance. Its three levels are +, 0 and -, and it uses the following rule: if the next bit is a 0, the level does not change; if the next bit is a 1, the signal moves to the next level in a fixed cycle of 0 → + → 0 → - → 0 → + and so on. The result is a signal whose rate is the same as NRZ-I, but whose worst-case bit pattern behaves like a periodic waveform rather than a flat line.",
            },
            {
              type: "list",
              items: [
                "Signal rate is the same as NRZ-I, so it does not pay Manchester's bandwidth penalty.",
                "The worst-case pattern for bandwidth is a long run of 1s, which cycles the level +, 0, -, 0 and produces a periodic waveform.",
                "That periodic waveform can be approximated as an analog signal at one quarter of the bit rate, which is the frequency the cable actually has to carry.",
                "Because it never spends long at one level, it has no significant DC component.",
              ],
            },
            {
              type: "p",
              text: "The quarter-rate result is the point of the scheme. In worst-case NRZ-I a run of 1s produces a square wave at half the bit rate; in MLT-3 the same run produces a cycle that takes four bit periods to complete, so its fundamental frequency is one quarter of the bit rate. That halving of the worst-case frequency content is what makes MLT-3 attractive for fast links, and it is why 100BASE-TX Fast Ethernet uses MLT-3 over Category 5 twisted pair: 125 Mbaud of MLT-3 has its worst-case energy content around 31.25 MHz, which a cheap cable can carry.",
            },
            {
              type: "example",
              text: "Encode the bit sequence 1 1 1 0 1 1 using MLT-3, starting from level 0.",
              steps: [
                "Start at level 0. Bit 1 → move to the next level in the cycle, which is +. Signal: +.",
                "Bit 1 → move on: + takes us to 0. Signal: 0.",
                "Bit 1 → move on: 0 takes us to -. Signal: -.",
                "Bit 0 → do not change level. Signal: -.",
                "Bit 1 → move on: - takes us to 0. Signal: 0.",
                "Bit 1 → move on: 0 takes us to +. Signal: +.",
                "Resulting levels: +, 0, -, -, 0, +. A long run of 1s cycles +, 0, -, 0, which is the periodic waveform whose fundamental is a quarter of the bit rate.",
              ],
            },
            {
              type: "h3",
              text: "Printing the whole family side by side",
            },
            {
              type: "table",
              head: ["Scheme", "Levels", "r", "Signal rate S = N/r", "DC?", "Self-sync?", "Error detect?", "Complexity"],
              rows: [
                ["Unipolar NRZ", "2 (one-sided)", "1", "N", "Severe", "No", "No", "Low"],
                ["Polar NRZ-L", "2", "1", "N", "Yes", "No", "No", "Low"],
                ["Polar NRZ-I", "2", "1", "N", "Smaller", "No", "No", "Low"],
                ["Polar RZ", "3", "1/2", "2N", "No", "Yes", "No", "High"],
                ["Manchester", "2", "1/2", "2N", "No", "Yes", "No", "High"],
                ["Diff. Manchester", "2", "1/2", "2N", "No", "Yes", "No", "High"],
                ["Bipolar AMI", "3", "1", "~N (0 bits emit nothing)", "No", "No", "Partial", "High"],
                ["2B1Q", "4", "2", "N/2", "Possibly", "Possibly", "No", "High"],
                ["8B6T", "3", "4/3", "3N/4", "No", "Yes", "Yes", "High"],
                ["4D-PAM5", "5", "2 per pair", "N/4 total (4 pairs)", "No", "Yes", "Yes", "Very high"],
                ["MLT-3", "3", "1", "~N/3 (ternary steps)", "No", "Partial", "No", "High"],
              ],
            },
          ],
        },
      ],
    },
    {
      id: "s11",
      title: "Block Coding: 4B/5B and 8B/10B",
      body: [
        {
          type: "fig",
          fig: "m03-p49-block-coding-concept",
          caption: "Block coding in three steps: division, substitution, combination.",
        },
        {
          type: "fig",
          fig: "m03-p48-block-coding",
          caption: "mB/nB block coding replaces each m-bit group with an n-bit group.",
        },
        {
          type: "fig",
          fig: "m03-p50-block-coding-4b-5b-with-nrz-i-line",
          caption: "4B/5B block coding feeding an NRZ-I line coder.",
        },
        {
          type: "fig",
          fig: "m03-p52-substitution-in-4b-5b-block-coding",
          caption: "Substitution: sixteen 4-bit data words become sixteen chosen 5-bit code words.",
        },
        {
          type: "fig",
          fig: "m03-p55-8b-10b-block-encoding",
          caption: "8B/10B replaces each byte with a ten-bit code word chosen to control run length and DC balance.",
        },
        {
          type: "fig",
          fig: "m03-p56-more-bits-better-error-detection",
          caption: "More redundant bits let the code choose words that prevent long runs of one voltage level.",
        },
        {
          type: "list",
          items: [
            "**Block coding** adds redundancy *before* line encoding: every m data bits become n code bits (**n > m**).",
            "**4B/5B** turns 4 bits into 5 (25% overhead); **8B/10B** turns 8 into 10.",
            "The extra bits buy **sync** (no long runs) and **error detection** (illegal patterns can be flagged).",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "how the code tables work",
          body: [
            {
              type: "p",
              text: "Block coding takes a different approach to the same problem. Instead of designing a clever waveform, it deliberately adds redundancy to the bit stream before line encoding, replacing every group of m data bits with a longer group of n bits chosen so that the resulting pattern cannot produce long runs of a single level or an unbalanced polarity. Because it works on bits rather than signal levels, it is written with a slash — xB/yB — to distinguish it from the multilevel mBnL notation.",
            },
            {
              type: "p",
              text: "Two motivations drive the extra bits. First, error detection needs redundancy: without spare code words there is no such thing as an illegal pattern, so nothing can be flagged. Second, synchronization needs transitions, and transitions can only be guaranteed in a signal if they are guaranteed in the bit stream — so the substitution table is chosen to break up the bit combinations that would otherwise produce long flat runs under the chosen line code.",
            },
            {
              type: "list",
              items: [
                "Division: the incoming bit stream is chopped into groups of m bits.",
                "Substitution: each m-bit group is replaced by its assigned n-bit code word.",
                "Combination: the n-bit code words are concatenated into a new bit stream, which is then handed to a line coder such as NRZ-I.",
              ],
            },
            {
              type: "h3",
              text: "4B/5B",
            },
            {
              type: "p",
              text: "4B/5B is the canonical block code. Each group of four data bits is replaced by a five-bit code word, which raises the bit rate by a factor of 5/4 = 1.25. The codebook is chosen so that no code word contains more than three consecutive 0s, which means that when the resulting stream is line-encoded with NRZ-I the receiver never has to endure a long run without transitions. Certain of the unused five-bit words are reserved as control symbols, and the standard pairing in this course is 4B/5B followed by NRZ-I.",
            },
            {
              type: "p",
              text: "The redundancy arithmetic is worth doing carefully because it is a favourite exam item. A four-bit data word can take 2^4 = 16 combinations and a five-bit code word can take 2^5 = 32 combinations, so there are 32 - 16 = 16 spare code words. Those extras are what pay for the control and signalling functions — the classic examples being the idle, start-of-stream and end-of-stream delimiters — and what give the remaining code words their properties.",
            },
            {
              type: "example",
              text: "Data must be sent at 1 Mbps. What is the minimum bandwidth using a combination of 4B/5B and NRZ-I, and what if Manchester is used instead?",
              steps: [
                "4B/5B expands the bit rate by 5/4: 1,000,000 × 1.25 = 1,250,000 bps entering the line coder.",
                "With NRZ-I, B_min = N/2 = 1,250,000/2 = 625,000 Hz = 625 kHz.",
                "With Manchester, B_min = N because Manchester's average signal rate equals the bit rate: 1,250,000 Hz = 1.25 MHz.",
                "The NRZ-I pairing needs the lower bandwidth but keeps a DC component and relies on the block code for synchronization; the Manchester pairing needs twice the bandwidth but is DC-free and self-synchronizing on its own.",
              ],
            },
            {
              type: "h3",
              text: "8B/10B",
            },
            {
              type: "p",
              text: "8B/10B goes further, replacing each eight-bit byte with a ten-bit code word, an overhead of 10/8 = 1.25 — the same 25 percent expansion as 4B/5B, but applied to larger groups. The larger block buys a much bigger code space: 2^10 = 1024 code words for 2^8 = 256 data symbols, leaving 768 spare. That space is enough to guarantee both a bounded run length and a bounded running disparity, so the encoder can always pick between a code word and its complement to keep the number of 1s and 0s balanced over time.",
            },
            {
              type: "p",
              text: "The result is a code with strong DC balance, guaranteed transitions and a rich set of control characters, at the cost of a 25 percent higher line rate. 8B/10B is the code behind gigabit Ethernet's fibre and copper variants, Fibre Channel and PCI Express. The trade is explicit: more redundant bits buy better error detection and a cleaner spectrum, and the price is bandwidth.",
            },
          ],
        },
      ],
    },
    {
      id: "s12",
      title: "Scrambling: B8ZS and HDB3",
      body: [
        {
          type: "fig",
          fig: "m03-p57-scrambling",
          caption: "Scrambling substitutes a recognisable violation for any run of bits the line code cannot handle.",
        },
        {
          type: "fig",
          fig: "m03-p58-ami-used-with-scrambling",
          caption: "AMI combined with scrambling: silence runs are broken by deliberate violations.",
        },
        {
          type: "fig",
          fig: "m03-p59-scrambling-example-b8zs",
          caption: "The two cases of B8ZS scrambling, differing in the polarity of the preceding pulse.",
        },
        {
          type: "fig",
          fig: "m03-p60-scrambling-example-hdb3",
          caption: "HDB3: four zeros become 000V or B00V depending on the parity of the preceding pulses.",
        },
        {
          type: "fig",
          fig: "m03-p61-different-situations-in-hdb3-scrambl",
          caption: "The situations in HDB3 scrambling and the substitution each one triggers.",
        },
        {
          type: "list",
          items: [
            "**Scrambling** solves sync **without** the bandwidth cost of block coding — it modifies the data pattern instead of adding bits.",
            "**B8ZS** (North America) and **HDB3** (Europe/Japan) both replace long runs of zeros with a deliberate violation pattern.",
            "The receiver recognises the violation and knows to substitute back the original zeros.",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "how violations get detected",
          body: [
            {
              type: "p",
              text: "Block coding buys synchronization with redundancy, and redundancy costs bandwidth — 4B/5B and 8B/10B both inflate the line rate by 25 percent. Scrambling takes the opposite tack. The ideal code, as the slides put it, does not increase the bandwidth for synchronization and has no DC components. Scrambling achieves this by replacing the unfriendly runs in the bit stream with a violation pattern that the receiver recognises and undoes, working on the fly at the same time as the line encoding.",
            },
            {
              type: "p",
              text: "The pattern is always the same: take a bipolar line code such as AMI, and whenever a run of the forbidden symbol exceeds a defined length, substitute a short code that deliberately breaks the AMI rule. Breaking the rule is the point — the violation is what makes the substitution unambiguous and self-identifying, so no side channel or extra frame is needed to signal it.",
            },
            {
              type: "h3",
              text: "B8ZS",
            },
            {
              type: "p",
              text: "B8ZS, the North American standard, substitutes any run of eight consecutive zeros with the eight-symbol sequence 000VB0VB. In that notation B stands for bipolar — the pulse obeys the AMI alternation rule — while V stands for violation, a pulse that deliberately breaks the rule. The word is inserted only when eight zeros actually occur, and its shape depends on the polarity of the last pulse transmitted before the run.",
            },
            {
              type: "list",
              items: [
                "If the last pulse before the eight zeros was positive, the substitution is 000+-0-+.",
                "If the last pulse before the eight zeros was negative, the substitution is 000-+0+-.",
                "In both cases the two V pulses carry the same polarity, which is impossible under AMI and therefore unmistakable.",
                "The two B pulses obey the alternation rule and carry the timing information that the eight zeros would have destroyed.",
              ],
            },
            {
              type: "p",
              text: "Note the DC consequence: each B8ZS substitution replaces eight zero-voltage symbols with a pattern whose pulses cancel in pairs, so the running balance is preserved. The code therefore keeps AMI's freedom from DC while removing its fatal weakness, and it does so without adding a single bit to the data stream.",
            },
            {
              type: "h3",
              text: "HDB3",
            },
            {
              type: "p",
              text: "HDB3 is the European equivalent, but it handles runs of four zeros rather than eight. Any run of four consecutive zeros is replaced by either 000V or B00V, and the choice between the two forms is what keeps the pulse count even. The rule given in the slides is stated in terms of the number of nonzero pulses since the last substitution: if that count is odd the substitution is 000V, and if it is even the substitution is B00V, so that the total number of nonzero pulses after the substitution is even.",
            },
            {
              type: "example",
              text: "Write out the four HDB3 substitution cases explicitly, assuming the last pulse before the run of four zeros was positive.",
              steps: [
                "Odd number of nonzero pulses since the last substitution and the preceding pulse is positive: substitute 000V with V positive, i.e. 000+.",
                "Odd number of nonzero pulses and the preceding pulse is negative: substitute 000V with V negative, i.e. 000-.",
                "Even number of nonzero pulses and the preceding pulse is positive: substitute B00V where B is negative and V is positive, i.e. -00+.",
                "Even number of nonzero pulses and the preceding pulse is negative: substitute B00V where B is positive and V is negative, i.e. +00-.",
                "In every case the V pulse breaks the AMI alternation rule, so the receiver can find the substitution and replace it with four zeros.",
              ],
            },
            {
              type: "table",
              head: ["Property", "B8ZS", "HDB3"],
              rows: [
                ["Region of use", "North America (DS1 / T1)", "Europe and most of the world (E-carrier)"],
                ["Run length it fixes", "Eight zeros", "Four zeros"],
                ["Substitution forms", "000VB0VB", "000V or B00V"],
                ["Choice of form", "Depends on the polarity of the last pulse", "Depends on the parity of nonzero pulses since the last substitution"],
                ["Bits added", "None", "None"],
                ["DC component", "None", "None"],
                ["Self-synchronization", "Yes", "Yes"],
              ],
            },
            {
              type: "note",
              text: "Both scramblers are substitutes for redundancy, not additions to it: unlike 4B/5B, neither raises the bit rate, which is exactly why DS1 and E1 carry their full nominal rates rather than 1.25 times them. The price is that the receiver must run the inverse substitution logic, which is more complex than simply reading a codebook.",
            },
          ],
        },
      ],
    },
    {
      id: "s13",
      title: "Analog-to-Digital Conversion: PCM Sampling",
      body: [
        {
          type: "fig",
          fig: "m03-p63-components-of-pcm-encoder",
          caption: "Components of a PCM encoder: band-limiting filter, sampler, quantizer, encoder.",
        },
        {
          type: "fig",
          fig: "m03-p65-three-different-sampling-methods-for",
          caption: "Ideal, natural and flat-top sampling compared.",
        },
        {
          type: "fig",
          fig: "m03-p66-nyquist-theorem",
          caption: "The Nyquist theorem states the minimum sampling rate for a baseband signal.",
        },
        {
          type: "fig",
          fig: "m03-p67-nyquist-sampling-rate-for-low-pass-a",
          caption: "Nyquist sampling rate for low-pass and bandpass signals.",
        },
        {
          type: "list",
          items: [
            "**PCM** digitises analog in three steps: **sample → quantise → encode**.",
            "First pass the signal through a **low-pass filter**, because the highest frequency present sets the minimum sampling rate.",
            "**Nyquist sampling**: sample at least **twice** the highest frequency, or you cannot reconstruct the original.",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "the sampling theorem",
          body: [
            {
              type: "p",
              text: "Pulse Code Modulation digitizes an analog signal in three steps: sampling, quantization and binary encoding. Before any of that happens, the incoming signal must be passed through a low-pass filter, because the highest frequency present determines the minimum sampling rate. The filter both enforces the band limit and removes components that would distort the signal shape after sampling.",
            },
            {
              type: "h3",
              text: "Sampling",
            },
            {
              type: "p",
              text: "The analog signal is measured every T_s seconds. T_s is the sampling interval and f_s = 1/T_s is the sampling rate or frequency. Three methods appear in the slides: ideal sampling places an impulse at each sampling instant; natural sampling uses a short pulse of varying amplitude; and flat-top sampling, also called sample and hold, uses a short pulse held at a single amplitude for the duration of the sample. Flat-top sampling is the practical choice, because holding the value steady long enough for the quantizer to work on it is far easier than trying to encode an instantaneous value.",
            },
            {
              type: "p",
              text: "The raw output of the sampler is a series of pulses of varying amplitude, called a PAM signal, and those amplitudes are still continuous — they can take any value between the minimum and maximum. PAM is therefore only an intermediate step, and the quantizer that follows is what makes the values finite and therefore encodable.",
            },
            {
              type: "formula",
              tex: "f_s = \\dfrac{1}{T_s}",
              text: "The sampling frequency is the reciprocal of the sampling interval: take one sample every T seconds and you collect 1/T samples per second.",
            },
            {
              type: "h3",
              text: "The Nyquist sampling theorem",
            },
            {
              type: "formula",
              tex: "f_s \\ge 2 f_{max}",
              text: "The sampling rate must be at least twice the highest frequency contained in the signal; sampling below that rate loses information irrecoverably.",
            },
            {
              type: "p",
              text: "The intuitive version of the theorem is the sine-wave demonstration. Sampling a single sine wave at f_s = 4f, which is twice the Nyquist rate, recovers a good approximation; sampling at f_s = 2f, exactly the Nyquist rate, also recovers the wave acceptably but leaves no margin; sampling at f_s = f, only half the Nyquist rate, produces a signal that is aliased — it looks like a completely different, lower-frequency waveform. Aliasing is not a degradation that more care at the decoder can fix; the information is simply gone.",
            },
            {
              type: "p",
              text: "One subtlety matters for the bandpass case, and the slides call it out explicitly. For a low-pass signal whose energy runs from 0 up to some maximum frequency f, the maximum frequency is known, so the sampling rate is 2f. For a bandpass signal, whose energy occupies a band from f1 to f2 without including DC, the bandwidth alone does not give the maximum frequency, so the minimum sampling rate cannot be determined from the bandwidth by itself — you must know where the band sits.",
            },
            {
              type: "example",
              text: "A complex bandpass signal has a bandwidth of 200 kHz. What is the minimum sampling rate?",
              steps: [
                "The bandwidth is f2 - f1 = 200 kHz.",
                "Nyquist's rule requires sampling at 2 f_max = 2 f2, and f2 is not given.",
                "Two different signals with the same 200 kHz bandwidth — one at 100 kHz to 300 kHz and one at 10 MHz to 10.2 MHz — have the same bandwidth but completely different f_max.",
                "Therefore the minimum sampling rate cannot be determined from the given information; the position of the band is needed as well.",
              ],
            },
            {
              type: "example",
              text: "Telephone companies digitize voice by assuming a maximum frequency of 4000 Hz. What sampling rate does that imply?",
              steps: [
                "The band-limited voice signal has f_max = 4,000 Hz.",
                "Nyquist: f_s ≥ 2 × f_max = 2 × 4,000.",
                "f_s = 8,000 samples per second.",
                "This is the classic 8 kHz voice sampling rate used throughout telephone networks.",
              ],
            },
          ],
        },
      ],
    },
    {
      id: "s14",
      title: "Quantization, Encoding and PCM Bit Rate",
      body: [
        {
          type: "fig",
          fig: "m03-p74-quantization-zones",
          caption: "Eight quantization zones spanning -20 V to +20 V, with midpoints at odd multiples of 2.5 V.",
        },
        {
          type: "fig",
          fig: "m03-p76-quantization-and-encoding-of-a-sampl",
          caption: "A sampled sine wave being quantized to zone midpoints and encoded into binary.",
        },
        {
          type: "fig",
          fig: "m03-p78-quantization-error-and-snqr",
          caption: "Uniform zones give quiet signals a worse signal-to-quantization-noise ratio than loud ones.",
        },
        {
          type: "fig",
          fig: "m03-p82-4-82",
          caption: "Components of a PCM decoder: hold circuit followed by a low-pass reconstruction filter.",
        },
        {
          type: "list",
          items: [
            "**Quantisation** maps infinite amplitude values onto a finite set of levels — this is where *quantisation error* enters.",
            "Each sample is approximated by the **midpoint** of its zone, then encoded in **log₂L bits**.",
            "**PCM bit rate = sampling rate × bits per sample** — e.g. 8000 × 8 = 64 kbps for one voice channel.",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "PCM bit rate",
          body: [
            {
              type: "p",
              text: "Sampling converts a continuous-time signal into a discrete-time sequence, but each sample still has an amplitude chosen from infinitely many possible values between the minimum and the maximum. Quantization maps that infinite set onto a finite one by dividing the amplitude range into L zones of equal height and assigning each zone a single representative value.",
            },
            {
              type: "formula",
              tex: "\\Delta = \\dfrac{V_{max} - V_{min}}{L}",
              text: "The height of each quantization zone is the total amplitude range, maximum minus minimum, divided by the number L of quantization levels.",
            },
            {
              type: "p",
              text: "Each zone is then given a value from 0 to L-1, conventionally the midpoint of the zone, and every sample falling inside a zone is approximated by that midpoint. The number of bits needed to encode the L levels is the number of bits per sample, and it follows from the levels by a base-2 logarithm.",
            },
            {
              type: "formula",
              tex: "n_b = \\log_2 L",
              text: "The number of bits per sample is the base-2 logarithm of the number of quantization levels: L equals 2 to the power n_b.",
            },
            {
              type: "p",
              text: "The slides' worked example is worth reproducing in full because it exercises every step. Take a voltage signal with V_min = -20 V and V_max = +20 V, and use L = 8 quantization levels. The zone height is (20 - (-20))/8 = 40/8 = 5 V. The eight zones run from -20 to -15, -15 to -10, -10 to -5, -5 to 0, 0 to +5, +5 to +10, +10 to +15 and +15 to +20, and their midpoints are -17.5, -12.5, -7.5, -2.5, +2.5, +7.5, +12.5 and +17.5 volts.",
            },
            {
              type: "example",
              text: "Show how the eight zones of the example are numbered and coded.",
              steps: [
                "n_b = log2 L = log2 8 = 3 bits per sample.",
                "Zone -20 to -15: code 000. Midpoint -17.5 V.",
                "Zone -15 to -10: code 001. Midpoint -12.5 V.",
                "Zone -10 to -5: code 010. Midpoint -7.5 V.",
                "Zone -5 to 0: code 011. Midpoint -2.5 V.",
                "Zone 0 to +5: code 100. Midpoint +2.5 V.",
                "Zone +5 to +10: code 101. Midpoint +7.5 V.",
                "Zone +10 to +15: code 110. Midpoint +12.5 V.",
                "Zone +15 to +20: code 111. Midpoint +17.5 V.",
                "A sample of, say, +6.2 V falls in the +5 to +10 zone and is transmitted as 101, reconstructing at +7.5 V.",
              ],
            },
            {
              type: "h3",
              text: "Quantization error and the SNR",
            },
            {
              type: "p",
              text: "Quantizing introduces error, because the transmitted code word stands for a midpoint rather than the sample's actual value. The difference between the two is the quantization error, and with the sample assumed to land anywhere in the zone with equal probability the error is bounded by half a zone: at most delta/2 in magnitude. More zones means a smaller delta and therefore a smaller error, but more zones also means more bits per sample and a proportionally higher bit rate.",
            },
            {
              type: "formula",
              tex: "|e| \\le \\dfrac{\\Delta}{2}",
              text: "The maximum quantization error is half the zone height, because the worst a sample can be from its zone's midpoint is half a zone.",
            },
            {
              type: "p",
              text: "Uniform quantization has an asymmetry that hurts quiet signals. The error range, delta/2, is fixed for every signal level, but the signal power changes — so a quiet passage suffers a much worse signal-to-quantization-noise ratio than a loud one. Two techniques are used to fix this. One is to make the quantization levels follow a logarithmic curve, dense at low amplitudes and sparse at high ones. The other is companding, in which the sample values are compressed at the sender into logarithmic zones of fixed height and expanded back at the receiver. Both aim at holding the SNR roughly constant across the whole dynamic range.",
            },
            {
              type: "p",
              text: "The additive result worth carrying beyond the slides is the standard approximation for uniform quantization of a full-scale sinusoid, SNR in decibels roughly equal to 6.02 times the number of bits plus 1.76. Each additional bit per sample therefore buys about 6 dB of SNR, which is why telephony settled on 8 bits, giving about 50 dB — enough for intelligible speech, though not for high-fidelity music.",
            },
            {
              type: "h3",
              text: "Bit rate, bandwidth and the decoder",
            },
            {
              type: "formula",
              tex: "\\text{Bit rate} = n_b \\times f_s",
              text: "The PCM bit rate equals the number of bits per sample multiplied by the sampling rate in samples per second.",
            },
            {
              type: "p",
              text: "The bandwidth needed to carry that bit rate then depends entirely on the line coding used, which is why this section closes the loop with the earlier ones. A digitized signal always needs more bandwidth than the original analog signal — the slides call this the price paid for robustness and the other advantages of digital transmission.",
            },
            {
              type: "example",
              text: "Digitize the human voice, whose frequencies run from 0 to 4000 Hz, using 8 bits per sample. Find the sampling rate and the bit rate.",
              steps: [
                "Nyquist: f_s = 2 × 4,000 = 8,000 samples per second.",
                "Bits per sample: n_b = 8, so L = 2^8 = 256 quantization levels.",
                "Bit rate = n_b × f_s = 8 × 8,000 = 64,000 bps.",
                "This 64 kbps figure is the standard rate of a single digitized telephone voice channel.",
              ],
            },
            {
              type: "example",
              text: "Compare sending a 4 kHz low-pass analog signal directly against digitizing it at 8 bits per sample.",
              steps: [
                "Direct analog transmission: B_min = 4,000 Hz = 4 kHz.",
                "Digitizing: f_s = 2 × 4,000 = 8,000 samples/s, so the bit rate is 8 × 8,000 = 64,000 bps.",
                "Minimum bandwidth for the digital signal at two levels: B_min = bit rate / 2 = 64,000/2 = 32,000 Hz = 32 kHz.",
                "The digital channel needs 32 kHz against 4 kHz for analog — eight times the bandwidth, the extra factor being 2 bits per hertz times 8 bits per sample divided by 2.",
              ],
            },
            {
              type: "p",
              text: "Recovering the analog signal uses the reverse chain. A hold circuit keeps each decoded amplitude steady until the next pulse arrives, producing a staircase approximation of the original waveform, and a low-pass filter whose cutoff equals the highest frequency in the pre-sampled signal then smooths the staircase back into a continuous signal. The higher the number of levels L, the finer the staircase and the less distorted the recovered signal.",
            },
          ],
        },
      ],
    },
    {
      id: "s15",
      title: "Delta Modulation and DPCM",
      body: [
        {
          type: "fig",
          fig: "m03-p85-the-process-of-delta-modulation",
          caption: "Delta modulation: the encoder tracks the signal with a staircase that steps up or down by a fixed amount.",
        },
        {
          type: "fig",
          fig: "m03-p86-delta-modulation-components",
          caption: "Delta modulation encoder: comparator, quantizer, integrator in the feedback path.",
        },
        {
          type: "fig",
          fig: "m03-p87-delta-demodulation-components",
          caption: "Delta demodulator: integrator and low-pass filter reconstruct the original signal.",
        },
        {
          type: "fig",
          fig: "m03-p88-delta-pcm-dpcm",
          caption: "DPCM quantizes the difference rather than just its sign, trading bits for accuracy.",
        },
        {
          type: "list",
          items: [
            `**Delta modulation** sends only **one bit per sample**: "went up" or "went down" from the previous value.`,
            "**DPCM** sends the *difference* from a prediction instead of the full value — same idea, more bits.",
            "Delta collapses when the signal swings faster than one step per sample — **slope overload**.",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "slope overload",
          body: [
            {
              type: "p",
              text: "PCM transmits a full code word for every sample, which is expensive when consecutive samples are very similar. Delta modulation exploits that redundancy by transmitting only one bit per sample, describing whether the signal went up or down relative to the previous sample: if the pulse at time t_n+1 is higher in amplitude than the pulse at time t_n, a 1 is sent; if it is lower, a 0 is sent.",
            },
            {
              type: "p",
              text: "The scheme works beautifully when the signal changes slowly between samples, because a fixed step size can track a slowly varying waveform closely, and it collapses when the signal changes quickly. If the amplitude swings by more than one step between samples, the staircase cannot keep up and the result is slope overload, a large accumulated error that sounds like noise on reconstruction.",
            },
            {
              type: "p",
              text: "The encoder's structure explains why it is cheap: a comparator works out the sign of the difference between the incoming sample and the running estimate held in an integrator, a one-bit quantizer emits that sign, and the integrator adds the step back so the estimate follows the signal. The decoder is simply the same integrator plus a low-pass filter, which is why delta modulation hardware is far simpler than PCM hardware.",
            },
            {
              type: "p",
              text: "The natural fix for slope overload is to keep the one-bit-per-sample structure but describe the difference more accurately, and that is differential PCM. Instead of one bit for the sign of the difference, several bits are used to quantize the difference itself, so each transmitted code represents how much the signal changed. More bits per difference means more levels of resolution and therefore higher accuracy, at the cost of a higher bit rate.",
            },
            {
              type: "table",
              head: ["Property", "PCM", "Delta modulation", "DPCM"],
              rows: [
                ["What is transmitted", "The quantized sample value", "One bit: the sign of the change", "A multi-bit code for the change"],
                ["Bits per sample", "n_b = log2 L", "1", "Several, depending on the difference resolution"],
                ["Bit rate for the same signal", "Highest", "Lowest", "Between the two"],
                ["Accuracy", "Highest", "Lowest, with slope overload on fast changes", "Good"],
                ["Hardware complexity", "High", "Low", "Moderate"],
              ],
            },
            {
              type: "example",
              text: "Estimate the bit rate of delta-modulated voice. If the voice signal is sampled at the same 8,000 samples per second that PCM uses, and delta modulation sends a single bit per sample, the bit rate is 8,000 × 1 = 8,000 bps, against 64,000 bps for 8-bit PCM. The saving is a factor of eight; the cost is that the fixed step size cannot follow rapid amplitude changes.",
              steps: [
                "Sampling rate f_s = 8,000 samples per second.",
                "Delta modulation: 1 bit per sample.",
                "Bit rate = 1 × 8,000 = 8,000 bps.",
                "Compare with 8-bit PCM: 8 × 8,000 = 64,000 bps. The ratio is 8:1.",
              ],
            },
          ],
        },
      ],
    },
    {
      id: "s16",
      title: "Transmission Modes: Parallel, Serial, Asynchronous, Synchronous, Isochronous",
      body: [
        {
          type: "fig",
          fig: "m03-p90-parallel-transmission",
          caption: "Parallel transmission: n bits at a time over n wires, one clock tick per group.",
        },
        {
          type: "fig",
          fig: "m03-p91-serial-transmission",
          caption: "Serial transmission: one bit per clock tick, in three subclasses.",
        },
        {
          type: "fig",
          fig: "m03-p93-asynchronous-transmission",
          caption: "Asynchronous framing: a start bit, the data byte, and one or more stop bits.",
        },
        {
          type: "fig",
          fig: "m03-p95-synchronous-transmission",
          caption: "Synchronous transmission: a frame delimited by start and end bytes, bits packed with no gaps.",
        },
        {
          type: "list",
          items: [
            "**Parallel** sends n bits at once over n wires — fast, but only over very short distances.",
            "**Serial** sends one bit at a time on one path — cheap and skew-free, so all long links use it.",
            "**Async** frames each character with start/stop bits; **sync** sends continuous blocks; **isochronous** guarantees timing for real-time audio and video.",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "the three modes compared",
          body: [
            {
              type: "p",
              text: "Once the bits exist and the line code is chosen, they still have to be organized on the link. Binary data crosses a link in either parallel or serial mode. In parallel mode several bits travel at once, one per wire, and every clock tick moves a whole group; in serial mode a single bit moves per clock tick, and the serial family splits into asynchronous, synchronous and isochronous transmission.",
            },
            {
              type: "list",
              items: [
                "Parallel: n bits per tick over n separate wires, so it is n times faster than serial at the same clock rate, but the wires skew against each other and the cost grows with distance.",
                "Serial: one bit per tick over a single path, so it is cheaper per metre and skew is impossible, which is why long links are always serial.",
                "Practical limit on parallel: bit skew between wires, plus the cost of n conductors, which is why parallel survives only over very short distances such as a memory bus or an internal ribbon cable.",
              ],
            },
            {
              type: "h3",
              text: "Asynchronous transmission",
            },
            {
              type: "p",
              text: "Asynchronous transmission frames each byte with a start bit of 0 at the beginning and one or more stop bits of 1 at the end, and it permits a gap between bytes. The name is slightly misleading: the mechanism is asynchronous only at the byte level, because the sender may pause for any length of time between bytes. Within a byte the bits are perfectly synchronized, each occupying the same duration, because the receiver's clock restarts on the falling edge of every start bit.",
            },
            {
              type: "formula",
              tex: "\\text{Efficiency} = \\dfrac{m}{m + 2}",
              text: "For a data byte of m bits carried with a single start bit and a single stop bit, the useful fraction of the transmitted bits is m divided by m plus 2.",
            },
            {
              type: "example",
              text: "Find the overhead of asynchronous transmission for a single 8-bit character sent with one start bit and one stop bit.",
              steps: [
                "Each character occupies 1 start bit + 8 data bits + 1 stop bit = 10 bit intervals.",
                "Useful fraction = 8/10 = 0.8, so 80 percent efficiency.",
                "Overhead = 2/10 = 0.2, that is 20 percent of the transmitted time carries no data.",
                "Adding a second stop bit, as some systems do, gives 11 intervals and drops efficiency to 8/11 = 72.7 percent.",
              ],
            },
            {
              type: "h3",
              text: "Synchronous transmission",
            },
            {
              type: "p",
              text: "Synchronous transmission removes the per-byte framing overhead entirely: bits go out one after another with no start bits, no stop bits and no gaps, and it becomes the receiver's responsibility to find the byte boundaries. Bits are grouped into bytes and many bytes are collected into a frame, identified by a start byte at the front and an end byte at the back. Because the receiver must maintain byte alignment continuously, a clock recovery mechanism or a separate clock line is needed.",
            },
            {
              type: "p",
              text: "The comparison is a straightforward trade. Asynchronous framing is simple, needs no shared clock beyond per-byte resynchronization, and tolerates idle gaps, but it wastes about 20 percent of the line on framing bits at eight bits per byte. Synchronous transmission reclaims that 20 percent and is preferred for high-volume links, but it requires the receiver to stay locked to the sender's clock and it cannot tolerate arbitrary pauses.",
            },
            {
              type: "h3",
              text: "Isochronous transmission",
            },
            {
              type: "p",
              text: "Isochronous transmission is the guarantee-flavoured variant: bits are sent at a fixed rate with equal gaps between frames, and uneven gaps are simply not permitted. Where asynchronous transmission allows the sender to pause between bytes and synchronous transmission allows frames of varying length, isochronous transmission attaches a timing guarantee to the stream. That is precisely what a real-time service needs — a stream of voice or video samples that is delivered with the original spacing intact, because in those applications a delayed bit is as bad as a lost one.",
            },
            {
              type: "note",
              text: "The three serial modes map onto three different questions. Asynchronous asks how the receiver finds the start of each byte; synchronous asks how the receiver stays aligned across a long frame; isochronous asks how the receiver preserves the original timing between samples.",
            },
          ],
        },
      ],
    },
  ],
  flashcards: [
    { q: "What is line coding, in one sentence?",
      a: "Line coding is the conversion of a string of bits (digital data) into a sequence of signal levels (a digital signal) that denotes those 1s and 0s, and line decoding is the reverse at the receiver.", sec: "s1" },
    { q: "Distinguish the data rate from the signal rate.",
      a: "The data rate N is the number of bits sent per second in bps (bit rate). The signal rate S is the number of signal elements sent per second in bauds (modulation rate). A good scheme raises N while lowering S.", sec: "s3" },
    { q: "What does the ratio r mean, and what happens to the signal rate when r increases?",
      a: "r is the number of data elements carried by one signal element. S = c x N x 1/r, so a larger r (more bits packed into each signal element) produces a lower signal rate.", sec: "s2" },
    { q: "What are the values of the case factor c in the best, average and worst cases?",
      a: "Worst case c = 1, average case c = 1/2, best case c = 0. Course answers conventionally quote the average case, c = 1/2, which must be stated explicitly.", sec: "s3" },
    { q: "What is baseline wandering and what causes it?",
      a: "The receiver tracks a running average of received signal power called the baseline. A long run of 0s or 1s has no transitions and drags that baseline away from its true value, so later samples are compared against the wrong reference and decoding fails.", sec: "s5" },
    { q: "Why is a DC component a problem in line coding?",
      a: "A constant voltage level for a long time puts energy at very low frequencies. Most channels are bandpass and will not pass those frequencies, so the DC content is removed and the received waveform is distorted.", sec: "s5" },
    { q: "What is self-synchronization?",
      a: "A code is self-synchronizing when the signal itself carries enough transitions for the receiver to recover the sender's bit timing. It matters because a receiver clock running fast or slow misreads the incoming bits.", sec: "s5" },
    { q: "In the clock-skew example, what happens at 1 kbps versus 1 Mbps with a receiver clock 0.1 percent fast?",
      a: "At 1 kbps the receiver gets 1,001 bps instead of 1,000, so 1 extra bit per second. At 1 Mbps it gets 1,001,000 bps instead of 1,000,000, so 1,000 extra bits per second. A fixed fractional error scales with the data rate.", sec: "s5" },
    { q: "Why is unipolar NRZ considered a poor scheme?",
      a: "All its levels are on one side of the time axis, so it is prone to baseline wandering, carries a large DC component, has no self-synchronization and no error detection, and wastes power because the average level is never zero.", sec: "s6" },
    { q: "What is the difference between NRZ-L and NRZ-I?",
      a: "In NRZ-L the voltage level determines the bit: +V for one symbol, -V for the other. In NRZ-I the transition determines the bit: a 1 inverts the polarity and a 0 does not. Both average N/2 baud, but NRZ-I has less baseline wandering.", sec: "s6" },
    { q: "How many signal transitions does a polar RZ symbol contain and what does that cost?",
      a: "Two transitions per symbol, because the level always returns to zero half way through. This gives self-synchronization and no DC component, but doubles the baud rate and therefore the bandwidth, and requires three voltage levels.", sec: "s7" },
    { q: "What is the minimum bandwidth of Manchester and differential Manchester compared with NRZ?",
      a: "Twice that of NRZ. Manchester has r = 1/2, so the average signal rate is N and the minimum bandwidth equals the bit rate, whereas NRZ has an average signal rate of N/2.", sec: "s7" },
    { q: "How does differential Manchester differ from plain Manchester?",
      a: "Differential Manchester always has a mid-bit transition, but that transition is used only for synchronization. The bit value is carried by whether or not there is a level change at the start of the symbol, which makes it immune to inverted polarity on the line.", sec: "s7" },
    { q: "In AMI, what happens to the 1 symbol and the 0 symbol?",
      a: "In bipolar AMI the 0 symbol is zero voltage and each successive 1 alternates between +V and -V. Pseudoternary is the reverse: the 1 is zero voltage and the 0 alternates.", sec: "s8" },
    { q: "State AMI's main advantage and main weakness.",
      a: "Advantage: no DC component and no baseline wandering, because successive marks alternate polarity, plus partial error detection when two marks share a polarity. Weakness: no self-synchronization, because a long run of 0s produces no transitions at all.", sec: "s8" },
    { q: "What is the condition for a valid mBnL multilevel code?",
      a: "2 to the m must be less than or equal to L to the n. If 2^m exceeds L^n there are not enough signal patterns; if they are equal the mapping is exact with no redundancy; if 2^m is less than L^n the extra patterns allow error detection.", sec: "s9" },
    { q: "In 2B1Q, how many bits per signal element, and how many levels?",
      a: "Two binary bits per signal element with four (quaternary) levels: 2^2 = 4 patterns onto 4 levels, so the mapping is exact and there is no redundancy, and a DC component can appear.", sec: "s9" },
    { q: "How does redundancy let a code control its DC component?",
      a: "If every legal code word is given a single polarity weight (more + pulses than -), an inverted copy is recognisable as illegal. The transmitter sends whichever polarity keeps the running balance near zero, and the receiver inverts the inverted pattern back.", sec: "s9" },
    { q: "What is MLT-3's transition rule?",
      a: "With levels +, 0, -: a 0 bit keeps the current level, and a 1 bit moves to the next level in the cycle 0, +, 0, -, 0, + and so on. Its signal rate matches NRZ-I.", sec: "s10" },
    { q: "Why is a run of 1s in MLT-3 special?",
      a: "A long run of 1s cycles the level +, 0, -, 0 and produces a periodic waveform that can be approximated as an analog signal at one quarter of the bit rate, which reduces the frequency content the cable must carry.", sec: "s10" },
    { q: "What are the three steps of block coding and what does the slash notation mean?",
      a: "Division into m-bit groups, substitution of each group with an n-bit code word, and combination of the code words back into a stream. The xB/yB slash notation distinguishes block coding from multilevel mBnL coding.", sec: "s11" },
    { q: "How much redundancy does 4B/5B provide, and what is it used for?",
      a: "A 4-bit word has 16 combinations and a 5-bit word has 32, so there are 32 - 16 = 16 spare code words. They are used for control and signalling functions and to guarantee no long runs of 0s for the NRZ-I line coder.", sec: "s11" },
    { q: "Work the 4B/5B bandwidth example: 1 Mbps data through 4B/5B plus NRZ-I and plus Manchester.",
      a: "4B/5B raises the rate to 1.25 Mbps. With NRZ-I, B_min = N/2 = 625 kHz. With Manchester, B_min = N = 1.25 MHz. NRZ-I is cheaper in bandwidth but keeps a DC component.", sec: "s11" },
    { q: "What does B8ZS substitute, and what do B and V stand for?",
      a: "B8ZS replaces any eight consecutive zeros with 000VB0VB. B stands for bipolar and obeys the AMI alternation rule; V stands for violation and deliberately breaks it. The pattern depends on the polarity of the last pulse before the run.", sec: "s12" },
    { q: "State the HDB3 substitution rule.",
      a: "Four consecutive zeros become 000V or B00V depending on the number of nonzero pulses since the last substitution: if that count is odd the substitution is 000V, and if it is even it is B00V, so that the total number of nonzero pulses becomes even.", sec: "s12" },
    { q: "Why is scrambling preferred over block coding in DS1 and E1?",
      a: "Scrambling adds no bits, so the bit rate is not inflated as it is by 4B/5B's 25 percent expansion. The cost is that the receiver must run the inverse substitution logic rather than simply reading a codebook.", sec: "s12" },
    { q: "What are the three steps of PCM?",
      a: "Sampling, quantization and binary encoding. The analog signal is first low-pass filtered to bound its maximum frequency, then sampled, then each sample is mapped to a quantization zone and encoded as a binary code word.", sec: "s13" },
    { q: "State the Nyquist sampling theorem.",
      a: "The sampling rate must be at least twice the highest frequency contained in the signal: f_s is greater than or equal to 2 f_max. Sampling below that rate aliases the signal and loses information irrecoverably.", sec: "s13" },
    { q: "Why is flat-top sampling used in practice?",
      a: "Flat-top sampling, also called sample and hold, holds each sample at a single amplitude for the pulse duration, which gives the quantizer time to work. Ideal and natural sampling produce amplitudes that are harder to quantize in hardware.", sec: "s13" },
    { q: "Why can the minimum sampling rate of a bandpass signal not be found from its bandwidth alone?",
      a: "Nyquist needs the maximum frequency f_max, not the bandwidth. A bandpass signal with a 200 kHz bandwidth could run from 100 kHz to 300 kHz or from 10 MHz to 10.2 MHz, giving completely different sampling rates.", sec: "s13" },
    { q: "How do you compute the zone height and the number of bits per sample?",
      a: "Zone height delta = (V_max - V_min)/L, where L is the number of quantization levels. The number of bits per sample is n_b = log2 L. For V_max = +20 V, V_min = -20 V and L = 8, delta = 5 V and n_b = 3 bits.", sec: "s14" },
    { q: "What is the maximum quantization error and what sets it?",
      a: "The error is at most delta/2, half the zone height, because a sample is represented by its zone's midpoint and can be at most half a zone away from it. More zones mean a smaller delta and a smaller error, but more bits per sample.", sec: "s14" },
    { q: "Why is non-linear quantization or companding used?",
      a: "The quantization error range delta/2 is fixed for all levels, so quiet signals get a much worse signal-to-quantization-noise ratio than loud ones. Logarithmic levels or companding keeps the SNR roughly constant over the whole dynamic range.", sec: "s14" },
    { q: "Give the PCM bit rate formula and the telephone voice figure.",
      a: "Bit rate = n_b x f_s. For voice, f_s = 8,000 samples per second and n_b = 8 bits, giving bit rate = 8 x 8,000 = 64,000 bps, the standard single-channel telephone rate.", sec: "s14" },
    { q: "How much bandwidth does digitized 4 kHz voice need compared with the analog signal?",
      a: "Analog needs 4 kHz. Digitizing at 8 bits per sample gives 8 x 8,000 = 64,000 bps, and with a two-level line code B_min = N/2 = 32 kHz, which is eight times the analog bandwidth.", sec: "s14" },
    { q: "What does delta modulation actually send?",
      a: "One bit per sample, indicating only the sign of the change: a 1 if the amplitude rose relative to the previous sample and a 0 if it fell. It works well for slowly changing signals and suffers slope overload when the amplitude changes quickly.", sec: "s15" },
    { q: "How does DPCM improve on delta modulation?",
      a: "Instead of one bit for the sign of the difference, DPCM quantizes the difference itself with several bits, so each code represents how much the signal changed. More bits mean more levels and higher accuracy, at the cost of a higher bit rate.", sec: "s15" },
    { q: "Contrast parallel and serial transmission.",
      a: "Parallel sends n bits at once over n wires, one bit per wire per clock tick, so it is faster but suffers bit skew and costs more wiring. Serial sends one bit per clock tick over a single path, which is why long-distance links are serial.", sec: "s16" },
    { q: "Describe asynchronous transmission framing and its overhead.",
      a: "Each byte is bracketed by one start bit (0) at the front and one or more stop bits (1) at the back, with optional gaps between bytes. It is asynchronous only at the byte level; inside a byte the bits are synchronized. For 8 data bits with 1 start and 1 stop, efficiency is 8/10 = 80 percent.", sec: "s16" },
    { q: "What distinguishes isochronous transmission?",
      a: "It guarantees fixed, equal gaps between frames, so uneven gaps are not permitted. It is used where timing must be preserved, such as real-time voice and video, because a delayed bit is as bad as a lost one.", sec: "s16" },
    { q: "What does the Nyquist formula N_max = 2 x B x log2 L tell you?",
      a: "It gives the maximum data rate of a noiseless channel: twice the bandwidth times the base-2 logarithm of the number of signal levels. Doubling the bandwidth doubles the rate, and each doubling of the levels L adds one bit per hertz. For B = 3 kHz and L = 4, N_max = 2 x 3,000 x 2 = 12,000 bps.", sec: "s4" },
    { q: "What is the relationship between a baud rate of 500 kbaud in NRZ-I and the data rate?",
      a: "With r = 1 and the average case c = 1/2, S = c x N x 1/r gives N = 2S, so 500 kbaud corresponds to a 1 Mbps data rate. The minimum bandwidth is S = 500 kHz.", sec: "s6" },
  ],
  quiz: [
    { q: "A line code packs two data bits into each signal element. What is the value of r and what does it do to the signal rate?",
      choices: ["r = 1/2, and the signal rate doubles", "r = 2, and the signal rate is halved", "r = 2, and the signal rate doubles", "r = 1, and the signal rate is unchanged"],
      answer: 1,
      why: "r is the number of data elements per signal element, so packing two bits per element gives r = 2. Since S = c x N x 1/r, a larger r divides the signal rate down, halving it.", sec: "s2" },
    { q: "A signal carries data with one data element per signal element. The bit rate is 100 kbps. Using the average case, what is the signal rate?",
      choices: ["100 kbaud", "50 kbaud", "25 kbaud", "200 kbaud"],
      answer: 1,
      why: "S = c x N x 1/r with c = 1/2, N = 100,000 and r = 1 gives S = 0.5 x 100,000 = 50,000 baud. The worst case c = 1 would give 100 kbaud.", sec: "s3" },
    { q: "A system uses NRZ-I to transfer 1 Mbps. What are the average signal rate and the minimum bandwidth?",
      choices: ["1 Mbaud and 1 MHz", "500 kbaud and 500 kHz", "250 kbaud and 250 kHz", "2 Mbaud and 2 MHz"],
      answer: 1,
      why: "S = c x N x 1/r = 0.5 x 1,000,000 x 1 = 500,000 baud. For NRZ the minimum bandwidth equals the signal rate, so B_min = 500 kHz.", sec: "s6" },
    { q: "Which statement best captures the difference between NRZ-L and NRZ-I?",
      choices: ["NRZ-L uses three levels; NRZ-I uses two levels", "NRZ-L encodes the bit in the voltage level; NRZ-I encodes it in the presence or absence of a transition", "NRZ-L is self-synchronizing; NRZ-I is not", "NRZ-L has a lower average signal rate than NRZ-I"],
      answer: 1,
      why: "In NRZ-L the level itself carries the bit, while NRZ-I uses an inversion at the bit boundary for a 1 and no inversion for a 0. Both average N/2 baud and neither is self-synchronizing.", sec: "s6" },
    { q: "A receiver clock is 0.1 percent faster than the sender's at a data rate of 1 Mbps. How many extra bits per second does the receiver take in?",
      choices: ["1 bit", "10 bits", "100 bits", "1,000 bits"],
      answer: 3,
      why: "The receiver counts at 1.001 times the rate, so it takes in 1,000,000 x 1.001 = 1,001,000 bps, which is 1,000 extra bits per second over the 1,000,000 actually sent.", sec: "s5" },
    { q: "What is the minimum bandwidth of Manchester coding compared with NRZ for the same data rate?",
      choices: ["The same as NRZ", "Half of NRZ", "Twice NRZ", "Four times NRZ"],
      answer: 2,
      why: "Manchester has r = 1/2, so its average signal rate is c x N x 2 = N baud, while NRZ averages N/2 baud. The minimum bandwidth is therefore twice that of NRZ.", sec: "s7" },
    { q: "In bipolar AMI, which symbol is represented by zero voltage?",
      choices: ["The 1 symbol", "The 0 symbol", "Both symbols alternately", "Neither; zero is a violation"],
      answer: 1,
      why: "AMI represents the 0 symbol with zero voltage and alternates the 1 symbol between +V and -V. Pseudoternary is the reverse, with the 1 symbol at zero voltage.", sec: "s8" },
    { q: "Which weakness of AMI is the direct motivation for the B8ZS and HDB3 scramblers?",
      choices: ["Its large DC component", "Its long run of zeros producing no transitions", "Its inability to detect any error at all", "Its requirement for four voltage levels"],
      answer: 1,
      why: "AMI has no DC component and can detect violations, but a long run of 0s is encoded as silence and produces no transitions, so it loses self-synchronization. The scramblers break those runs with deliberate violations.", sec: "s12" },
    { q: "In the mBnL notation, what does the condition 2^m < L^n tell you about a code?",
      choices: ["The code is impossible because there are too few signals", "The mapping is exact with no redundancy", "There are spare signal patterns, allowing better error detection and noise immunity", "The code uses m channels in parallel"],
      answer: 2,
      why: "When the number of signal patterns exceeds the number of data patterns, the designer can choose well-separated patterns and forbid the rest, so an unused pattern signals an error. 2^m > L^n would make the code impossible.", sec: "s9" },
    { q: "How many spare code words does 4B/5B create, and what does the extra bit rate cost?",
      choices: ["8 spare words and a 20 percent rate increase", "16 spare words and a 25 percent rate increase", "16 spare words and no rate increase", "32 spare words and a 50 percent rate increase"],
      answer: 1,
      why: "A 4-bit word has 16 combinations and a 5-bit word has 32, so 32 - 16 = 16 words are spare. The bit rate rises by the factor 5/4, that is 25 percent.", sec: "s11" },
    { q: "Data is sent at 1 Mbps using 4B/5B with NRZ-I line coding. What is the minimum bandwidth?",
      choices: ["400 kHz", "500 kHz", "625 kHz", "1.25 MHz"],
      answer: 2,
      why: "4B/5B raises the rate to 1.25 Mbps, and NRZ-I needs B_min = N/2 = 625 kHz. Using Manchester instead would raise the requirement to 1.25 MHz.", sec: "s11" },
    { q: "What exactly does B8ZS transmit in place of eight consecutive zeros?",
      choices: ["000VB0VB, with the two V pulses sharing the same polarity", "B00VB00V, with alternating V pulses", "00000000, unchanged", "000V or B00V depending on pulse parity"],
      answer: 0,
      why: "B8ZS substitutes the eight-symbol pattern 000VB0VB. The two V pulses carry the same polarity, which is impossible under the AMI alternation rule and therefore unambiguous. The 000V or B00V choice belongs to HDB3.", sec: "s12" },
    { q: "In HDB3, when is the substitution B00V rather than 000V?",
      choices: ["When the number of nonzero pulses since the last substitution is even", "When the number of nonzero pulses since the last substitution is odd", "When the preceding pulse is negative", "When the run of zeros is eight long"],
      answer: 0,
      why: "If the count of nonzero pulses since the last substitution is even, B00V is used; if it is odd, 000V is used. Either way the substitution makes the total number of nonzero pulses even.", sec: "s12" },
    { q: "A low-pass signal has a maximum frequency of 4 kHz. What is the minimum sampling rate under Nyquist?",
      choices: ["2,000 samples/s", "4,000 samples/s", "8,000 samples/s", "16,000 samples/s"],
      answer: 2,
      why: "Nyquist requires sampling at least twice the highest frequency: f_s is greater than or equal to 2 x 4,000 = 8,000 samples per second. This is the standard telephone voice sampling rate.", sec: "s13" },
    { q: "A complex bandpass signal has a bandwidth of 200 kHz. What is its minimum sampling rate?",
      choices: ["400,000 samples/s", "200,000 samples/s", "100,000 samples/s", "It cannot be determined without knowing where the band starts and ends"],
      answer: 3,
      why: "Nyquist needs the maximum frequency, not the bandwidth. Two bandpass signals with the same 200 kHz bandwidth placed at different centre frequencies have completely different f_max values.", sec: "s13" },
    { q: "A signal runs from -20 V to +20 V and is quantized with L = 8 levels. What are the zone height and the bits per sample?",
      choices: ["delta = 5 V and n_b = 3", "delta = 2.5 V and n_b = 3", "delta = 5 V and n_b = 4", "delta = 8 V and n_b = 3"],
      answer: 0,
      why: "delta = (V_max - V_min)/L = (20 - (-20))/8 = 40/8 = 5 V, and n_b = log2 8 = 3 bits per sample.", sec: "s14" },
    { q: "What is the bit rate of digitized telephone voice sampled at the standard rate with 8 bits per sample?",
      choices: ["8,000 bps", "32,000 bps", "64,000 bps", "4,000 bps"],
      answer: 2,
      why: "Voice is assumed to reach 4,000 Hz, so f_s = 2 x 4,000 = 8,000 samples per second. Bit rate = n_b x f_s = 8 x 8,000 = 64,000 bps.", sec: "s14" },
    { q: "Why is companding used in PCM?",
      choices: ["To increase the number of quantization levels", "To keep the signal-to-quantization-noise ratio roughly constant across the dynamic range", "To reduce the sampling rate below Nyquist", "To remove the need for a reconstruction filter"],
      answer: 1,
      why: "The quantization error range delta/2 is fixed for all levels, so quiet signals suffer a worse SNR than loud ones. Companding compresses low amplitudes at the sender and expands them at the receiver to equalise the SNR.", sec: "s14" },
    { q: "What does delta modulation transmit for each sample?",
      choices: ["The full quantized amplitude as a binary code", "One bit giving the sign of the change from the previous sample", "Four bits describing the size of the difference", "Nothing; it transmits only transitions"],
      answer: 1,
      why: "Delta modulation sends a single bit per sample: a 1 if the amplitude rose relative to the previous sample and a 0 if it fell. Using several bits for the size of the difference is DPCM.", sec: "s15" },
    { q: "What is slope overload in delta modulation?",
      choices: ["The step size is too large for quiet signals", "The fixed step cannot follow a rapidly changing signal, producing large errors", "The decoder filter has the wrong cutoff frequency", "Too many bits per sample saturate the channel"],
      answer: 1,
      why: "Delta modulation tracks the signal with a staircase of fixed step size. If the amplitude changes by more than one step between consecutive samples, the staircase cannot keep up and the accumulated error becomes large.", sec: "s15" },
    { q: "In asynchronous transmission with 8 data bits, one start bit and one stop bit per character, what is the efficiency?",
      choices: ["100 percent", "80 percent", "90 percent", "72.7 percent"],
      answer: 1,
      why: "Each character occupies 1 + 8 + 1 = 10 bit intervals, of which 8 carry data, so efficiency is 8/10 = 0.8, that is 80 percent. A second stop bit would reduce it to 8/11 = 72.7 percent.", sec: "s16" },
    { q: "A noiseless channel has a bandwidth of 3 kHz and the transmitter can create 4 distinct signal levels. What is the maximum data rate?",
      choices: ["3,000 bps", "6,000 bps", "12,000 bps", "24,000 bps"],
      answer: 2,
      why: "Nyquist gives N_max = 2 x B x log2 L = 2 x 3,000 x log2 4 = 2 x 3,000 x 2 = 12,000 bps. Raising the levels from 4 to 8 would raise it to 18,000 bps at the same bandwidth.", sec: "s4" },
    { q: "Which transmission mode guarantees fixed, equal gaps between frames?",
      choices: ["Asynchronous", "Synchronous", "Isochronous", "Parallel"],
      answer: 2,
      why: "Isochronous transmission permits no uneven gaps: bits are sent at a fixed rate with equal spacing between frames, which is what real-time voice and video need to preserve original timing.", sec: "s16" },
  ],
});
