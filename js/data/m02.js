window.NSCOM_MODULES = window.NSCOM_MODULES || [];
window.NSCOM_MODULES.push({
  id: "m02",
  num: 2,
  title: "Physical Communication Layer",
  accent: "#7fd694",
  icon: `<svg viewBox="0 0 32 32" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"><path d="M2 16h4l2.5-7L12 24l4-13 3 8 3-5h8"/><path d="M2 26h28" stroke-width="1.2" stroke-dasharray="2 3" opacity=".6"/></svg>`,
  summary:
    "The physical layer is the lowest layer of the OSI model and the one that actually puts bits onto the medium. This module covers how data becomes a signal: analog versus digital data and signals, periodic and aperiodic waveforms, the three parameters of a sine wave (amplitude, frequency, phase), wavelength, the time and frequency domains, composite signals and Fourier's insight, bandwidth, bit rate and bit interval, baseband and broadband transmission, the three transmission impairments (attenuation, distortion and noise), the signal-to-noise ratio and its decibel form, the Nyquist bit-rate limit for noiseless channels and the Shannon capacity limit for noisy ones, and finally the performance measures throughput, latency, propagation time, transmission time and jitter — each with worked arithmetic.",
  sections: [
    {
      id: "s1",
      title: "The Physical Layer and Its Job",
      body: [
        {
          type: "fig",
          fig: "m02-p03-signals",
          caption: "Slide: a waveform carrying a bit pattern — the signal is the physical representation of the bits.",
        },
        {
          type: "p",
          text: "The physical layer sits at the bottom of the OSI Reference Model. Its responsibility is to move a bit sequence across the network medium to the physical layer of the remote node, where the bits are reconstructed and handed up to the data link layer. It is the only layer that touches the actual physics of communication: voltages on copper, light pulses in fibre, or radio waves in free space.",
        },
        {
          type: "list",
          items: [
            "Lowest layer of the OSI Reference Model.",
            "Transmits bit sequences through the network medium to the physical layer of the remote node.",
            "Frames are reconstructed there and passed up to the data link layer.",
            "Physical layer protocols and specifications define every aspect of the transmission medium, for both wired and wireless environments.",
            "Those specifications include the type of cable and connectors, the electrical signal on each pin and connector, and the manner in which bit values are converted into physical signals.",
          ],
        },
        {
          type: "h3",
          text: "Where the layer boundaries fall",
        },
        {
          type: "p",
          text: "A useful mental model is that the data link layer deals in frames and error control, while the physical layer deals only in symbols and timing. The physical layer never inspects a frame, never checks a checksum and never decides who may transmit; it takes whatever bit stream it is given and reproduces that stream as faithfully as physics allows at the far end. Everything that can go wrong between those two points is a transmission impairment.",
        },
        {
          type: "note",
          text: "Exam tip: if a question mentions cables, connectors, pin assignments, voltage levels, bit encoding or symbol timing, the answer is layer 1. If it mentions framing, addressing or error detection, that is layer 2.",
        },
        {
          type: "h3",
          text: "Additive depth: the four characteristics of a physical-layer standard",
        },
        {
          type: "p",
          text: "Standard texts (Forouzan's framework, which these slides follow) describe a physical-layer specification through four characteristics. Mechanical characteristics fix the physical shape of the interface — connectors, pin counts, cable dimensions. Electrical characteristics define the voltage levels, the permitted data rate and the distance limits for those voltages. Functional characteristics define what each circuit or pin does. Procedural characteristics define the sequence of events used to exchange data. When you read that the physical layer 'includes the type of cable and connectors used, the electrical signals associated with each pin, and how bit values become physical signals', those are these four groups restated.",
        },
        {
          type: "table",
          head: ["Characteristic", "What it fixes", "Example"],
          rows: [
            ["Mechanical", "Connector shape, pin layout, cable size", "RJ-45 jack with 8 pins"],
            ["Electrical", "Voltage levels, data rate, distance", "0 V and +5 V representing 0 and 1"],
            ["Functional", "Role of each pin or circuit", "Which pair carries transmit data"],
            ["Procedural", "Order of events for a transfer", "When the transmitter may begin sending bits"],
          ],
        },
      ],
    },
    {
      id: "s2",
      title: "Signals: Analog and Digital, Periodic and Non-Periodic",
      body: [
        {
          type: "fig",
          fig: "m02-p03-signals",
          caption: "Slide: a waveform carrying a bit pattern — the signal is the physical representation of the bits.",
        },
        {
          type: "p",
          text: "A signal is the physical representation of data. One cannot be sent without the other: data are the information, and the signal is the energy pattern that carries that information across a medium. Signals can be either analog or digital. An analog signal has infinitely many levels of intensity over a period of time, while a digital signal can have only a limited number of defined values. The simplest way to show a signal is to plot it on a pair of perpendicular axes, with the vertical axis representing the value or strength of the signal and the horizontal axis representing time.",
        },
        {
          type: "fig",
          fig: "m02-p04-analog-and-digital-signals",
          caption: "Slide: an analog signal is continuous in amplitude; a digital signal jumps between a finite set of levels.",
        },
        {
          type: "h3",
          text: "Periodic and non-periodic signals",
        },
        {
          type: "list",
          items: [
            "A periodic signal has a repeating pattern within a time frame; that time frame is called a period.",
            "The pattern repeats over subsequent identical periods; the completion of one full pattern is called a cycle.",
            "A non-periodic (aperiodic) signal changes without exhibiting a pattern or cycle that repeats over time.",
            "Both analog and digital signals can be periodic or non-periodic.",
          ],
        },
        {
          type: "fig",
          fig: "m02-p05-periodic-and-non-periodic-signals",
          caption: "Slide: periodic signals repeat identically; non-periodic signals never repeat.",
        },
        {
          type: "p",
          text: "The distinction matters because period and frequency are only meaningful descriptions for periodic signals. For a periodic signal, T is unambiguous: the shortest interval after which the waveform repeats. For a non-periodic signal such as a digital bit stream, the waveform may never repeat at all, so time-domain descriptions such as period give way to bit rate and bit interval. That is exactly why most digital signals are characterised by bit rate rather than frequency.",
        },
        {
          type: "note",
          text: "Data can be analog or digital, and so can the signal that carries it. In practice we almost always use periodic analog signals for long-haul analog transmission and non-periodic digital signals for baseband digital transmission.",
        },
        {
          type: "example",
          text: "Classify each: (a) the 50 Hz mains voltage in a wall socket, (b) a single spoken word over a telephone handset, (c) the square-wave clock output of a microcontroller, (d) a random bit stream from a sensor.",
          steps: [
            "(a) Analog signal, periodic — it repeats 50 times every second.",
            "(b) Analog signal, non-periodic — speech changes constantly and the waveform never repeats exactly.",
            "(c) Digital signal, periodic — two levels, repeating at a fixed clock frequency.",
            "(d) Digital signal, non-periodic — the pattern depends on the data and generally never repeats.",
          ],
        },
      ],
    },
    {
      id: "s3",
      title: "The Sine Wave: Amplitude, Frequency, Phase",
      body: [
        {
          type: "fig",
          fig: "m02-p06-the-sine-wave",
          caption: "Slide: the sine wave is the simplest periodic analog signal and the building block of all composite signals.",
        },
        {
          type: "p",
          text: "A sine wave is described completely by three parameters: frequency, amplitude and phase. Amplitude is the absolute value of the signal's highest intensity, proportional to the energy it carries. Frequency is the number of periods in one second. Period is the amount of time, in seconds, that a signal needs to complete one cycle. Frequency is formally expressed in hertz (Hz), which means cycles per second. Phase, or phase shift, describes the position of the waveform relative to time zero, and is measured in degrees or radians.",
        },
        {
          type: "fig",
          fig: "m02-p07-sine-wave-frequency-and-amplitude",
          caption: "Slide: the frequency-and-amplitude picture — four cycles in one second means f = 4 Hz and T = 1/4 s.",
        },
        {
          type: "formula",
          tex: "T = \\frac{1}{f} \\qquad f = \\frac{1}{T} \\qquad t = \\frac{1}{f}",
          text: "Period equals one divided by frequency, frequency equals one divided by period, and the time to complete one cycle equals one divided by the frequency. All three are the same relation read in different directions.",
        },
        {
          type: "h3",
          text: "Phase",
        },
        {
          type: "p",
          text: "Phase describes where in its cycle the wave sits when time equals zero. A wave starting at zero and rising has 0 degrees of phase; the same wave shifted forward by a quarter cycle starts at its peak and has 90 degrees of phase. Shifting by half a cycle gives 180 degrees, three quarters of a cycle gives 270 degrees, and a full cycle (360 degrees) returns the wave to its original position. Phase is measured in degrees or radians, and 360 degrees equals 2π radians.",
        },
        {
          type: "fig",
          fig: "m02-p08-sine-wave-phase",
          caption: "Slide: three sine waves of identical frequency and amplitude but different phase (0°, 90°, 180°).",
        },
        {
          type: "p",
          text: "Amplitude, frequency and phase are independent. Two sine waves can share a frequency and still differ in amplitude (one is louder or brighter) or in phase (their peaks occur at different moments). This independence is what makes a sine wave so useful: each parameter can be varied separately to encode information, which is precisely the idea behind amplitude, frequency and phase modulation in later modules.",
        },
        {
          type: "formula",
          tex: "s(t) = A \\sin(2\\pi f t + \\phi)",
          text: "The signal at time t equals the amplitude A times the sine of two pi times frequency times time, plus the phase angle phi. A sets the height, f sets how fast it repeats, and phi sets where it starts.",
        },
        {
          type: "example",
          text: "A sine wave completes 12 full cycles in 3 seconds. Find its frequency and period, then state the phase after 1/48 s if the wave starts at 0° having just crossed zero going upward.",
          steps: [
            "f = cycles / time = 12 / 3 = 4 Hz.",
            "T = 1/f = 1/4 = 0.25 s per cycle.",
            "Elapsed time 1/48 s is a fraction 1/48 ÷ 0.25 = 1/12 of one cycle.",
            "Fraction 1/12 of 360° = 30° of phase.",
          ],
        },
        {
          type: "example",
          text: "Two sine waves both run at 1 kHz with an amplitude of 5 V. Wave B is delayed by 0.25 ms relative to wave A. What is the phase difference?",
          steps: [
            "T = 1/f = 1/1000 = 1 ms.",
            "Delay = 0.25 ms = one quarter of a period.",
            "One quarter of a cycle is 360°/4 = 90°.",
            "So B lags A by 90° (π/2 radians).",
          ],
        },
      ],
    },
    {
      id: "s4",
      title: "Wavelength",
      body: [
        {
          type: "fig",
          fig: "m02-p09-wavelength",
          caption: "Slide: wavelength binds period or frequency to the propagation speed of the medium.",
        },
        {
          type: "p",
          text: "Wavelength is another characteristic of a signal travelling through a transmission medium. It binds the period or the frequency of a simple sine wave to the propagation speed of the medium. Wavelength is the distance a single cycle occupies in space, so it is measured in metres (or multiples of metres), never in seconds. Because it depends on the medium, the same frequency yields a different wavelength in copper, fibre and free space.",
        },
        {
          type: "formula",
          tex: "\\lambda = \\frac{c}{f} = c \\cdot T",
          text: "Wavelength equals the propagation speed divided by the frequency, which is the same as the propagation speed multiplied by the period. The faster the medium propagates the wave, or the lower the frequency, the longer each cycle is in space.",
        },
        {
          type: "fig",
          fig: "m02-p10-wavelength-example",
          caption: "Slide: red light at 4 × 10¹⁴ Hz in free space has a wavelength of 0.75 µm.",
        },
        {
          type: "example",
          text: "Assume the frequency of red light is 4 × 10¹⁴ Hz and that it propagates in free space at 3 × 10⁸ m/s. What is its wavelength?",
          steps: [
            "λ = c / f",
            "λ = (3 × 10⁸) / (4 × 10¹⁴)",
            "λ = 0.75 × 10⁻⁶ m",
            "λ = 0.75 µm (about 750 nanometres — consistent with red light).",
          ],
        },
        {
          type: "note",
          text: "Note: c is equal to 3 × 10⁸ m/s in free space — also the speed of light. Inside a cable the propagation speed is lower (typically 0.6c to 0.9c), so the wavelength in the cable is correspondingly shorter.",
        },
        {
          type: "h3",
          text: "Additive depth: worked wavelength comparisons",
        },
        {
          type: "example",
          text: "A 1 MHz signal travels on a copper cable where the propagation speed is 2.4 × 10⁸ m/s. What is its wavelength? And on a 1 kHz signal in the same cable?",
          steps: [
            "λ = c / f = (2.4 × 10⁸) / (10⁶) = 240 m for the 1 MHz signal.",
            "For 1 kHz: λ = (2.4 × 10⁸) / (10³) = 240,000 m = 240 km.",
            "Lower frequency means longer wavelength for the same propagation speed.",
          ],
        },
        {
          type: "p",
          text: "Wavelength becomes practically important when the wavelength is short compared to the physical structure it travels through. Radio engineering rule of thumb: when an object is a significant fraction of a wavelength in size, it begins to reflect, diffract or absorb the wave, which is why antenna elements are sized in fractions of a wavelength and why microwave links need clear line-of-sight paths while AM broadcast signals, with wavelengths of hundreds of metres, pass around buildings.",
        },
        {
          type: "table",
          head: ["Frequency", "Propagation speed", "Wavelength"],
          rows: [
            ["4 × 10¹⁴ Hz (red light)", "3 × 10⁸ m/s", "0.75 µm"],
            ["1 MHz", "2.4 × 10⁸ m/s", "240 m"],
            ["1 kHz", "2.4 × 10⁸ m/s", "240 km"],
          ],
        },
      ],
    },
    {
      id: "s5",
      title: "Composite Signals and Bandwidth",
      body: [
        {
          type: "fig",
          fig: "m02-p11-composite-signals",
          caption: "Slide: a composite signal is made of many simple sine waves.",
        },
        {
          type: "p",
          text: "A composite signal is made of many simple sine waves. In the early 1900s the French mathematician Jean-Baptiste Fourier showed that a composite signal is a combination of simple sine waves with different frequencies, amplitudes and phases. A composite signal can be periodic or non-periodic. Fourier's result is the reason we can study complex signals at all: whatever a waveform looks like in the time domain, it can be built from, or decomposed into, sines and cosines.",
        },
        {
          type: "fig",
          fig: "m02-p12-composite-signal",
          caption: "Slide: three sine components at f, 3f and 9f sum to form the composite waveform.",
        },
        {
          type: "list",
          items: [
            "The example composite signal is composed of several sine waves that also have different amplitudes — three sine waves at f, 3f and 9f.",
            "The main (lowest) frequency is normally called the fundamental frequency.",
            "The other components are harmonics — integer multiples of the fundamental.",
          ],
        },
        {
          type: "h3",
          text: "Bandwidth of a composite signal",
        },
        {
          type: "p",
          text: "The range of frequencies contained in a composite signal is its bandwidth. Bandwidth is normally a difference between two numbers. For a spectrum running from 100 Hz to 4,000 Hz, the bandwidth is 4,000 − 100 = 3,900 Hz. Note carefully: bandwidth is an interval width, not the highest frequency present. A signal occupying 300 Hz to 3,300 Hz has a bandwidth of 3,000 Hz — this is exactly the voice channel used later in the telephone-line examples.",
        },
        {
          type: "fig",
          fig: "m02-p13-bandwidth",
          caption: "Slide: bandwidth is the difference between the highest and lowest frequencies in the composite signal.",
        },
        {
          type: "formula",
          tex: "B = f_{high} - f_{low}",
          text: "Bandwidth equals the highest frequency in the signal minus the lowest frequency in it. It measures the width of the frequency interval the signal occupies, not its centre.",
        },
        {
          type: "example",
          text: "A composite signal is represented by the three sine waves 100 kHz, 300 kHz and 900 kHz. What is its bandwidth?",
          steps: [
            "Lowest frequency = 100 kHz, highest = 900 kHz.",
            "B = f_high − f_low = 900 − 100 = 800 kHz.",
            "The fundamental is 100 kHz; 300 kHz and 900 kHz are its harmonics.",
          ],
        },
        {
          type: "note",
          text: "A digital signal, viewed through Fourier's eyes, is a composite analog signal whose bandwidth is theoretically infinite. When you sketch a square wave, you are drawing an infinite sum of odd harmonics — which is why the slide summary says a digital signal is a composite analog signal with infinite bandwidth.",
        },
        {
          type: "h3",
          text: "Additive depth: time domain versus frequency domain",
        },
        {
          type: "p",
          text: "A signal can be drawn two ways. The time-domain plot shows amplitude against time and is what we normally picture. The frequency-domain plot shows amplitude against frequency and reduces a complicated waveform to a handful of vertical spikes at the frequencies it contains. The two representations are equivalent — Fourier analysis converts between them — but the frequency-domain view is usually the useful one, because bandwidth, filtering and channel capacity are all statements about frequency.",
        },
        {
          type: "fig",
          fig: "m02-p34-performance-relationships",
          caption: "Slide: performance relationships — bandwidth in hertz, throughput, latency and jitter side by side.",
        },
        {
          type: "table",
          head: ["Signal", "Time-domain look", "Frequency-domain look"],
          rows: [
            ["1 kHz sine wave", "Single smooth wave", "One spike at 1 kHz"],
            ["Square wave at 1 kHz", "Sharp corners and flat tops", "Odd harmonics: 1, 3, 5, 7 … kHz"],
            ["Three-tone composite", "Jagged, non-sinusoidal", "Three spikes at 100, 300, 900 kHz"],
            ["Non-periodic random bit stream", "Irregular", "Continuous smear of all frequencies"],
          ],
        },
      ],
    },
    {
      id: "s6",
      title: "Digital Signals, Bit Rate and Bit Length",
      body: [
        {
          type: "fig",
          fig: "m02-p14-digital-signal",
          caption: "Slide: a digital signal can have more than two levels; each level needs log2 L bits.",
        },
        {
          type: "p",
          text: "Information can also be represented by a digital signal. A digital signal can have more than two levels. In general, if a signal has L levels, each level needs log2 L bits. Most digital signals are non-periodic, and thus period and frequency are not appropriate characteristics for them — instead we describe them by bit rate and bit interval. Bit rate is the number of bits sent in one second, expressed in bits per second (bps). Bit length (also called bit interval) is the distance one bit occupies on the transmission medium, or equivalently the duration of one bit.",
        },
        {
          type: "fig",
          fig: "m02-p15-transmitting-digital-signals",
          caption: "Slide: text is encoded to a bit stream, carried as a signal, and decoded back to text at the receiver.",
        },
        {
          type: "formula",
          tex: "n = \\log_2 L \\qquad \\text{bit interval} = \\frac{1}{\\text{bit rate}}",
          text: "The number of bits carried by one signal level equals the base-two logarithm of the number of levels, and the duration of one bit is one divided by the bit rate. Eight levels carry log2 8 = 3 bits each; at 500 kbps one bit lasts 2 microseconds.",
        },
        {
          type: "list",
          items: [
            "2 levels → log2 2 = 1 bit per level (ordinary binary signalling).",
            "4 levels → log2 4 = 2 bits per level.",
            "8 levels → log2 8 = 3 bits per level.",
            "16 levels → log2 16 = 4 bits per level.",
          ],
        },
        {
          type: "example",
          text: "A digital signal uses 16 distinct amplitude levels and transmits at a signalling rate of 200,000 symbols per second. What is the equivalent bit rate?",
          steps: [
            "Each level carries log2 16 = 4 bits.",
            "Bit rate = symbols per second × bits per symbol = 200,000 × 4.",
            "Bit rate = 800,000 bps = 800 kbps.",
          ],
        },
        {
          type: "example",
          text: "A link runs at 1 Mbps. What is the bit interval, and how long does a 2,000-bit frame occupy the medium?",
          steps: [
            "Bit interval = 1 / bit rate = 1 / 10⁶ s = 1 µs.",
            "Frame time = 2,000 bits × 1 µs = 2 ms.",
          ],
        },
        {
          type: "note",
          text: "Note the two meanings of 'bit length': temporally it is the duration of one bit (seconds), spatially it is the distance one bit occupies on the medium (metres). Both are quoted on the slide; context tells you which is meant.",
        },
        {
          type: "table",
          head: ["Bit rate", "Bit interval"],
          rows: [
            ["1 kbps", "1 ms"],
            ["1 Mbps", "1 µs"],
            ["500 kbps", "2 µs"],
            ["1 Gbps", "1 ns"],
          ],
        },
      ],
    },
    {
      id: "s7",
      title: "Baseband and Broadband Transmission",
      body: [
        {
          type: "fig",
          fig: "m02-p16-baseband-transmission",
          caption: "Slide: baseband transmission sends the digital signal directly, without converting it to analog.",
        },
        {
          type: "p",
          text: "Baseband transmission means sending a digital signal over a channel without changing it to an analog signal. This is possible for a wide-bandwidth medium, and the slide describes it as a dedicated medium with a bandwidth constituting only one channel. The digital signal is placed on the medium exactly as it is generated — a low-pass channel that starts at zero frequency is required, because a square-ish waveform needs its low-frequency content to hold its shape.",
        },
        {
          type: "fig",
          fig: "m02-p17-baseband-transmission",
          caption: "Slide: with a low-pass channel of limited bandwidth, we approximate the digital signal with an analog signal.",
        },
        {
          type: "note",
          text: "In a low-pass channel with limited bandwidth, we approximate the digital signal with an analog signal. The level of approximation depends on the bandwidth available — more bandwidth means higher harmonics survive and the received pulse looks squarer.",
        },
        {
          type: "fig",
          fig: "m02-p18-broadband-transmission",
          caption: "Slide: broadband transmission changes the digital signal to an analog signal; modulation lets us use a bandpass channel.",
        },
        {
          type: "p",
          text: "Broadband transmission means changing the digital signal to an analog signal for transmission. Modulation allows us to use a bandpass channel — a channel with a bandwidth that does not start from zero. Radio, TV, mobile telephony and cable-data services all work this way: the digital payload is modulated onto a carrier at some centre frequency and occupies a band around it, leaving the rest of the spectrum free for other channels.",
        },
        {
          type: "table",
          head: ["", "Baseband", "Broadband"],
          rows: [
            ["What is sent", "The digital signal as-is", "An analog signal that carries the digital data"],
            ["Channel type needed", "Low-pass, starting at 0 Hz", "Bandpass, centred on a carrier"],
            ["Bandwidth", "Dedicated, relatively wide", "A slice of spectrum not starting at zero"],
            ["Typical use", "LAN Ethernet, USB, T1 lines", "DSL, cable modems, Wi-Fi, broadcast radio"],
          ],
        },
        {
          type: "p",
          text: "The conversion cost is real. Baseband saves the modulator and demodulator, but requires a medium whose response extends down to DC. Broadband spends the modulator, but gains the ability to share a physical medium among many users by giving each one a different band of frequencies — the foundation of frequency-division multiplexing and of every subscription-broadband technology. The slide's diagram of a modulator on the sending side and a demodulator on the receiving side, repeated at both ends for bidirectional links, is the standard arrangement.",
        },
        {
          type: "example",
          text: "A twisted-pair line carries a baseband digital signal and the engineer needs to know why the pulse 'rounds off' after 2 km. Explain using bandwidth.",
          steps: [
            "A perfect rectangular pulse is a composite signal with infinite bandwidth.",
            "The cable provides a low-pass channel with a finite upper cutoff frequency.",
            "Harmonics above the cutoff are attenuated, so sharp edges and corners are lost.",
            "The received pulse keeps its centre but spreads at the edges — the level of approximation depends on the bandwidth available.",
          ],
        },
      ],
    },
    {
      id: "s8",
      title: "Transmission Impairment: Attenuation and the Decibel",
      body: [
        {
          type: "fig",
          fig: "m02-p19-transmission-impairment",
          caption: "Slide: what was sent as 'Hello' can arrive as 'Heck' — a single impaired bit changes the message.",
        },
        {
          type: "p",
          text: "Signals do not survive a medium untouched. The slide's illustration is blunt: 'Hello' goes out, a corrupted bit stream comes back, and the receiver prints 'Heck'. There are three impairments to account for — attenuation, distortion and noise — and all three reduce the ability of the receiver to decide correctly whether a bit was a 0 or a 1.",
        },
        {
          type: "h3",
          text: "Attenuation",
        },
        {
          type: "p",
          text: "When a signal, simple or composite, travels through a medium it loses some of its energy in overcoming the resistance of the medium. Attenuation means a loss of energy. To compensate for this loss, amplifiers are used to amplify the signal. To show that a signal has lost or gained strength, engineers use the unit of the decibel (dB). Because the loss is a ratio, the decibel is the natural bookkeeping unit: a chain of amplification and attenuation stages simply adds and subtracts decibels.",
        },
        {
          type: "fig",
          fig: "m02-p20-attenuation",
          caption: "Slide: attenuation loses signal energy; an amplifier restores it.",
        },
        {
          type: "fig",
          fig: "m02-p21-decibel",
          caption: "Slide: the decibel measures the relative strengths of two signals, or of one signal at two different points.",
        },
        {
          type: "formula",
          tex: "dB = 10 \\log_{10}\\!\\left(\\frac{P_2}{P_1}\\right)",
          text: "The decibel change equals ten times the base-ten logarithm of the power at point two divided by the power at point one. P1 and P2 are the powers of the signal at points 1 and 2. A negative result means attenuation; a positive result means amplification.",
        },
        {
          type: "p",
          text: "P1 and P2 are the powers of a signal at points 1 and 2 respectively. If P2 < P1 the signal has been attenuated and dB is negative; if P2 > P1 the signal has been amplified and dB is positive. Because the scale is logarithmic, equal multiplicative changes are equal additive changes: halving the power is always −3 dB, doubling it is always +3 dB, and multiplying by a thousand is always +30 dB, no matter what the absolute power was.",
        },
        {
          type: "fig",
          fig: "m02-p22-attenuation-example",
          caption: "Slide: attenuation example — the power is reduced to one half, so P2 = ½ P1.",
        },
        {
          type: "example",
          text: "A signal travels through a transmission medium and its power is reduced to one half. This means P2 = ½ P1. Find the attenuation in decibels.",
          steps: [
            "dB = 10 log10(P2 / P1)",
            "dB = 10 log10(1/2) = 10 × (−0.301)",
            "dB = −3.01 dB, conventionally quoted as −3 dB.",
            "The minus sign confirms attenuation, matching the slide's note that the decibel is negative when a signal is attenuated.",
          ],
        },
        {
          type: "table",
          head: ["Power ratio P2/P1", "Decibels", "Meaning"],
          rows: [
            ["1", "0 dB", "No change"],
            ["2", "+3 dB", "Doubled (amplified)"],
            ["1/2", "−3 dB", "Halved (attenuated)"],
            ["10", "+10 dB", "Ten times stronger"],
            ["1/10", "−10 dB", "One tenth as strong"],
            ["1000", "+30 dB", "A thousand times stronger"],
            ["1/1000", "−30 dB", "One thousandth as strong"],
          ],
        },
        {
          type: "example",
          text: "A cable run attenuates 3 dB per kilometre. The transmitter launches 1 W and the run is 3 km long. What power arrives, and what is the total attenuation in decibels?",
          steps: [
            "Total attenuation = 3 km × (−3 dB/km) = −9 dB.",
            "−9 dB means the power has been divided by 2 three times: 1 W → ½ W → ¼ W → ⅛ W.",
            "Received power = 0.125 W = 125 mW.",
            "Check: 10 log10(0.125 / 1) = 10 × (−0.903) = −9.03 dB ≈ −9 dB.",
          ],
        },
        {
          type: "note",
          text: "Exam tip: decibels add, ratios multiply. Convert every stage to dB, add them, then convert back once at the end — this avoids compounding rounding errors. Also remember that dB is a ratio and has no units; if a question wants an absolute power level it will use dBm (dB relative to 1 mW).",
        },
      ],
    },
    {
      id: "s9",
      title: "Distortion and Noise",
      body: [
        {
          type: "fig",
          fig: "m02-p23-distortion",
          caption: "Slide: distortion changes the form or shape of the signal.",
        },
        {
          type: "p",
          text: "Distortion means that the signal changes its form or shape. Distortion can occur in a composite signal made of different frequencies, because the components of a composite signal may arrive at different times owing to different propagation speeds per frequency. A square wave that leaves the transmitter with crisp edges can arrive with smeared, rounded edges and a shifted peak; the information content is degraded even though the signal has not lost overall strength.",
        },
        {
          type: "p",
          text: "The key difference from attenuation is that distortion does not necessarily reduce power. Attenuation makes the signal weaker; distortion makes it wrong. A distorted signal can be just as strong as the original while no longer representing the original waveform, which is why simply adding an amplifier does not fix distortion — it amplifies the error along with the signal. Distortion is a real concern on long copper runs and on any medium where the velocity of propagation varies across the band of frequencies used.",
        },
        {
          type: "h3",
          text: "Noise",
        },
        {
          type: "p",
          text: "Noise corrupts the signal at the receiving end. Unlike attenuation and distortion, noise is energy that was never part of the transmitted signal; it is added by the channel and by the environment. The slide identifies four types that matter.",
        },
        {
          type: "fig",
          fig: "m02-p24-noise",
          caption: "Slide: the four noise types — thermal, induced, crosstalk and impulse.",
        },
        {
          type: "list",
          items: [
            "Thermal noise — the random motion of electrons in a wire, present in every conductor above absolute zero.",
            "Induced noise — comes from sources such as motors and appliances, which act as a sending antenna while the medium acts as a receiving antenna.",
            "Crosstalk — signals jumping from one wire to another, which normally happens with adjacent wires.",
            "Impulse noise — a spike that comes from power lines, lightning and the like.",
          ],
        },
        {
          type: "table",
          head: ["Noise type", "Source", "Character", "Countermeasure"],
          rows: [
            ["Thermal", "Random electron motion in the conductor", "Continuous, broadband, unavoidable", "Cool the front end; use more power or better SNR"],
            ["Induced", "Motors and appliances radiating", "Continuous, often at mains frequency and harmonics", "Shielding, twisting, physical separation"],
            ["Crosstalk", "Adjacent wires coupling to each other", "Continuous, proportional to signal in the neighbouring pair", "Twisted pairs, shielding, spacing between pairs"],
            ["Impulse", "Power lines, lightning, switching transients", "Short, high-amplitude spikes", "Error detection and retransmission; surge suppression"],
          ],
        },
        {
          type: "note",
          text: "Impulse noise is usually described as the most damaging type for digital data, even though it occurs only briefly. A single spike can wipe out a burst of several bits, whereas the continuous noise types degrade every bit only slightly and can be averaged out by the receiver's decision circuit.",
        },
        {
          type: "p",
          text: "The four types are distinguished by their origin rather than by their statistics. Thermal noise arises inside the conductor itself and cannot be eliminated, only budgeted for. Induced noise and crosstalk are both forms of unwanted coupling from outside the intended signal path; the difference is that induction comes from an unrelated device acting as an antenna while crosstalk comes from a neighbouring signal-carrying conductor in the same cable. Impulse noise arrives as isolated bursts of energy rather than a steady hiss, which is why it corrupts groups of adjacent bits instead of raising the error rate uniformly.",
        },
        {
          type: "example",
          text: "A lab bench shows a corrupted serial link whenever a bench drill is switched on, and a second corrupted link whenever two unshielded pairs run alongside each other. Name the dominant noise type in each case.",
          steps: [
            "The drill is a motor: it radiates and the cable picks that energy up as an antenna. That is induced noise.",
            "Two parallel signal-carrying wires coupling into one another is crosstalk — signals jumping from one wire to another, normally with adjacent wires.",
          ],
        },
      ],
    },
    {
      id: "s10",
      title: "Signal-to-Noise Ratio (SNR and SNRdB)",
      body: [
        {
          type: "fig",
          fig: "m02-p25-signal-to-noise-ratio-snr",
          caption: "Slide: SNR is the ratio of what is wanted (signal) to what is not wanted (noise).",
        },
        {
          type: "p",
          text: "SNR is the ratio of what is wanted — the signal — to what is not wanted — the noise. A high SNR means the signal is less corrupted by noise; a low SNR means the signal is more corrupted by noise. Because the two powers can differ by many orders of magnitude, the ratio is also quoted in decibels, and it is the decibel form that appears in the Shannon capacity formula.",
        },
        {
          type: "formula",
          tex: "\\text{SNR} = \\frac{P_{signal}}{P_{noise}} \\qquad \\text{SNR}_{dB} = 10 \\log_{10}(\\text{SNR})",
          text: "The signal-to-noise ratio is the average signal power divided by the average noise power. The decibel form is ten times the base-ten logarithm of that plain ratio. SNR is a plain number with no unit; SNRdB is expressed in decibels.",
        },
        {
          type: "fig",
          fig: "m02-p26-snr-example",
          caption: "Slide: SNR example — signal power 10 mW and noise power 1 µW.",
        },
        {
          type: "example",
          text: "The power of a signal is 10 mW and the power of the noise is 1 µW. What are the values of SNR and SNRdB?",
          steps: [
            "Convert to the same unit: 10 mW = 10 × 10⁻³ W = 10⁻² W; 1 µW = 10⁻⁶ W.",
            "SNR = P_signal / P_noise = 10⁻² / 10⁻⁶ = 10,000.",
            "SNRdB = 10 log10(10⁴) = 10 × 4 = 40 dB.",
            "Sanity check: 1 µW is 1/10,000 of the signal, and four factors of ten corresponds to 40 dB.",
          ],
        },
        {
          type: "example",
          text: "A receiver measures SNRdB = 20 dB. What is the plain SNR ratio, and what does the answer mean physically?",
          steps: [
            "From SNRdB = 10 log10(SNR), rearrange: SNR = 10^(SNRdB/10).",
            "SNR = 10^(20/10) = 10² = 100.",
            "The signal power is 100 times the noise power — adequate but far from the 3162 used in the telephone-line example.",
          ],
        },
        {
          type: "table",
          head: ["SNR (plain)", "SNRdB", "Quality"],
          rows: [
            ["1", "0 dB", "Signal and noise equally strong — unusable"],
            ["10", "10 dB", "Poor"],
            ["100", "20 dB", "Marginal"],
            ["3,162", "≈35 dB", "Typical data-grade telephone line"],
            ["10,000", "40 dB", "Good"],
            ["10⁶", "60 dB", "Excellent"],
          ],
        },
        {
          type: "note",
          text: "Watch the units trap: if one power is given in milliwatts and the other in microwatts, convert before dividing. The ratio is what matters, and a unit slip changes the answer by a factor of a thousand — three whole decibels of error compounding into every later calculation.",
        },
      ],
    },
    {
      id: "s11",
      title: "Data Rate Limits: Nyquist Bit Rate",
      body: [
        {
          type: "fig",
          fig: "m02-p27-data-rate",
          caption: "Slide: bit rate and its units — 1000 kbps = 1 Mbps.",
        },
        {
          type: "p",
          text: "An important consideration in data communications is how fast we can send data over a channel, in bits per second. Data rate depends on three factors: the bandwidth available, the level of the signals we use, and the quality of the channel (the level of noise). Two theoretical formulas were developed to calculate the data rate — the Nyquist theorem for a noiseless channel and the Shannon theorem for a noisy one.",
        },
        {
          type: "fig",
          fig: "m02-p28-data-rate-limits",
          caption: "Slide: data rate depends on bandwidth, number of signal levels, and channel quality (noise).",
        },
        {
          type: "fig",
          fig: "m02-p29-nyquist-bit-rate",
          caption: "Slide: Nyquist bit rate for a noiseless channel.",
        },
        {
          type: "formula",
          tex: "\\text{BitRate} = 2 \\times B \\times \\log_2 L",
          text: "The bit rate of a noiseless channel equals two, times the bandwidth B of the channel in hertz, times the base-two logarithm of the number of signal levels L. The formula does not assume any noise in the channel.",
        },
        {
          type: "list",
          items: [
            "bandwidth = bandwidth of the channel, in hertz.",
            "L = number of signal levels used.",
            "The factor of 2 is the Nyquist sampling relation: the highest usable signalling rate is twice the bandwidth.",
            "Increasing the number of levels can increase the bit rate, but the receiver must be able to distinguish the levels.",
          ],
        },
        {
          type: "fig",
          fig: "m02-p30-nyquist-example",
          caption: "Slide: noiseless 3000 Hz channel with two signal levels.",
        },
        {
          type: "example",
          text: "Consider a noiseless channel with a bandwidth of 3000 Hz transmitting a signal with two signal levels. What is the theoretical data rate?",
          steps: [
            "BitRate = 2 × B × log2 L",
            "BitRate = 2 × 3000 × log2 2",
            "log2 2 = 1",
            "BitRate = 2 × 3000 × 1 = 6000 bps = 6 kbps.",
          ],
        },
        {
          type: "example",
          text: "The same 3000 Hz noiseless channel is upgraded to four signal levels, then to eight. What is the bit rate each time?",
          steps: [
            "Four levels: log2 4 = 2, so BitRate = 2 × 3000 × 2 = 12,000 bps = 12 kbps.",
            "Eight levels: log2 8 = 3, so BitRate = 2 × 3000 × 3 = 18,000 bps = 18 kbps.",
            "Each doubling of the number of levels adds exactly 1 bit per symbol, i.e. +6 kbps here.",
          ],
        },
        {
          type: "p",
          text: "The formula also works backwards, which is how exam questions are usually posed. A 1 MHz noiseless channel asked to carry 10 Mbps needs log2 L = 10 Mbps ÷ (2 × 1 MHz) = 5, so L = 2⁵ = 32 levels. The engineering catch is that the receiver must distinguish 32 distinct levels in the presence of whatever noise exists — in the real world the channel is never noiseless, which is why the Shannon formula must be applied alongside Nyquist before committing to a design.",
        },
        {
          type: "note",
          text: "Careful with language: Nyquist gives the maximum bit rate assuming no noise. It is an upper bound, not a promise. Also note that bit rate and baud (symbol) rate are different quantities — bit rate = baud rate × log2 L.",
        },
      ],
    },
    {
      id: "s12",
      title: "Shannon Capacity for Noisy Channels",
      body: [
        {
          type: "fig",
          fig: "m02-p31-shannon-capacity",
          caption: "Slide: Shannon capacity of a channel depends on bandwidth and SNR — note there is no mention of signal levels.",
        },
        {
          type: "p",
          text: "Shannon's theorem states that the capacity of a channel can be computed from its bandwidth and its signal-to-noise ratio. Note that there is no indication of the signal level in the formula: this means that the levels of the signal do not dictate the capacity of the channel. Shannon's result is a hard ceiling on information transfer for the given bandwidth and noise, no matter how cleverly the signalling is designed.",
        },
        {
          type: "formula",
          tex: "C = B \\times \\log_2(1 + \\text{SNR})",
          text: "Capacity in bits per second equals the bandwidth of the channel in hertz, times the base-two logarithm of one plus the signal-to-noise ratio. Here SNR is the plain power ratio, not the decibel value.",
        },
        {
          type: "list",
          items: [
            "Capacity = capacity of the channel in bits per second (bps).",
            "bandwidth = bandwidth of the channel in hertz.",
            "SNR = signal-to-noise ratio of the channel as a plain ratio (convert from SNRdB first).",
          ],
        },
        {
          type: "fig",
          fig: "m02-p32-shannon-example",
          caption: "Slide: Shannon example on a telephone line with a 3000 Hz bandwidth and SNR of 3162.",
        },
        {
          type: "example",
          text: "Calculate the theoretical highest bit rate of a regular telephone line. A telephone line normally has a bandwidth of 3000 Hz (300 to 3300 Hz) assigned for data communications. The signal-to-noise ratio is usually 3162. What is the capacity?",
          steps: [
            "C = B × log2(1 + SNR)",
            "C = 3000 × log2(1 + 3162)",
            "C = 3000 × log2(3163)",
            "log2(3163) ≈ 11.627",
            "C ≈ 3000 × 11.627 ≈ 34,881 bps ≈ 34.9 kbps.",
            "The 3162 value corresponds to SNRdB = 10 log10(3162) ≈ 35 dB — the standard quality figure for a voice-grade line.",
          ],
        },
        {
          type: "fig",
          fig: "m02-p33-using-nyquist-and-shanon",
          caption: "Slide: using both theorems on a 1 MHz channel with SNR 63 — capacity is 6 Mbps, and 4 Mbps is chosen in practice.",
        },
        {
          type: "example",
          text: "A channel has a 1 MHz bandwidth and an SNR of 63. What are the appropriate bit rate and signal level?",
          steps: [
            "Shannon first, because the channel is noisy: C = B × log2(1 + SNR).",
            "C = 1 × 10⁶ × log2(1 + 63) = 1 × 10⁶ × log2(64).",
            "log2(64) = 6, so C = 1 × 10⁶ × 6 = 6,000,000 bps = 6 Mbps.",
            "6 Mbps is the upper limit; the slide's choice is to use 4 Mbps for better performance, leaving headroom.",
            "Now Nyquist for the level count: BitRate = 2 × B × log2 L, so 4 × 10⁶ = 2 × 10⁶ × log2 L.",
            "log2 L = 2, therefore L = 2² = 4 signal levels.",
          ],
        },
        {
          type: "table",
          head: ["Theorem", "Applies to", "Inputs used", "Answers"],
          rows: [
            ["Nyquist", "Noiseless channel", "Bandwidth B, number of levels L", "Maximum bit rate"],
            ["Shannon", "Noisy channel", "Bandwidth B, SNR", "Maximum capacity in bps"],
          ],
        },
        {
          type: "note",
          text: "Procedure for combined questions: use Shannon to find the ceiling, pick a practical rate at or below it, then use Nyquist to find how many levels that rate requires. Never use the Shannon ceiling itself as the Nyquist level count — the slide deliberately selects 4 Mbps instead of 6 Mbps.",
        },
      ],
    },
    {
      id: "s13",
      title: "Throughput, Latency, Propagation Time and Jitter",
      body: [
        {
          type: "p",
          text: "Bandwidth can be expressed in hertz or in bits per second, and the higher the bandwidth in hertz the higher the achievable bit rate. Throughput is a measure of how fast we can actually send data through a network. A link may have a bandwidth of B bps, but we can only send T bps through this link, with T always less than B. Latency or delay defines how long it takes for an entire message to arrive completely at the destination, measured from the time the first bit is sent out from the source. Jitter is the difference in delay or latency per packet.",
        },
        {
          type: "formula",
          tex: "\\text{Latency} = \\text{propagation time} + \\text{transmission time} + \\text{queuing time} + \\text{processing delay}",
          text: "Total latency is the sum of the propagation time (energy travelling through the medium), the transmission time (bits being clocked onto the link), the queuing time spent waiting in buffers, and the processing delay inside intermediate devices.",
        },
        {
          type: "formula",
          tex: "\\text{Propagation time} = \\frac{\\text{Distance}}{\\text{Propagation Speed}} \\qquad \\text{Transmission time} = \\frac{\\text{Message size}}{\\text{Bandwidth}}",
          text: "Propagation time equals the distance divided by the propagation speed, and transmission time equals the message size divided by the bandwidth. Propagation depends on distance and the medium; transmission depends on message length and the link's bit rate.",
        },
        {
          type: "fig",
          fig: "m02-p35-latency-propagation-time-and",
          caption: "Slide: latency decomposed into propagation time, transmission time, queuing time and processing delay.",
        },
        {
          type: "fig",
          fig: "m02-p36-example",
          caption: "Slide: worked example — 2.5-KB message, 1 Gbps, 12,000 km, propagation speed 2.4 × 10⁸ m/s.",
        },
        {
          type: "example",
          text: "What are the propagation time and the transmission time for a 2.5-KB (kilobyte) message — an email — if the bandwidth of the network is 1 Gbps? Assume the distance between sender and receiver is 12,000 km and that light travels at 2.4 × 10⁸ m/s.",
          steps: [
            "Propagation time = Distance / Propagation Speed = (12,000 × 1000) / (2.4 × 10⁸).",
            "= 12,000,000 / 240,000,000 = 0.05 s = 50 ms.",
            "Transmission time = Message size / Bandwidth = (2500 × 8) / 10⁹.",
            "= 20,000 / 1,000,000,000 = 0.00002 s = 0.020 ms.",
            "The two are wildly different: a 2.5-KB email spends 50 ms in flight and only 0.02 ms being clocked out — about 2500 times longer in the wire than on the wire.",
          ],
        },
        {
          type: "fig",
          fig: "m02-p37-example",
          caption: "Slide: the worked latency example completed — propagation 50 ms, transmission 0.020 ms.",
        },
        {
          type: "example",
          text: "Same 2.5-KB message, same 12,000 km, but a slow 56 kbps link. Compare with the 1 Gbps case.",
          steps: [
            "Propagation time is unchanged at 50 ms (it does not depend on bandwidth).",
            "Transmission time = (2500 × 8) / 56,000 = 20,000 / 56,000 ≈ 0.357 s ≈ 357 ms.",
            "Total ≈ 50 + 357 = 407 ms — now transmission dominates and the link is bandwidth-limited, not distance-limited.",
          ],
        },
        {
          type: "p",
          text: "These two examples capture the whole point of the decomposition. On a fast long-haul link the distance term dominates; on a slow link the transmission term dominates; inside a congested router the queuing term dominates. Diagnosing a slow transfer means asking which of the four terms is largest. Satellite links are a textbook case: a geostationary hop of roughly 36,000 km adds about 120 ms of pure propagation delay one way, which no amount of added bandwidth can reduce.",
        },
        {
          type: "example",
          text: "A stream of packets arrives with latencies of 22 ms, 19 ms, 25 ms and 21 ms. What is the jitter?",
          steps: [
            "Jitter is the variation in delay per packet.",
            "Maximum latency = 25 ms, minimum latency = 19 ms.",
            "Jitter = 25 − 19 = 6 ms.",
            "Streaming audio and voice cope badly with jitter, so receivers buffer packets and play them out on a smoothed schedule.",
          ],
        },
        {
          type: "note",
          text: "Distinguish bandwidth from throughput, and latency from bandwidth: a link can have huge bandwidth and still deliver poor throughput because of latency, queuing or protocol overhead (the classic 'long fat pipe' problem). Also remember that throughput T is always less than the nominal bandwidth B.",
        },
      ],
    },
    {
      id: "s14",
      title: "Relationships and Summary",
      body: [
        {
          type: "fig",
          fig: "m02-p38-summary",
          caption: "Slide: summary of the physical-layer signal and capacity material.",
        },
        {
          type: "list",
          items: [
            "In data communications we commonly use periodic analog signals and non-periodic digital signals.",
            "A digital signal is a composite analog signal with an infinite bandwidth.",
            "For a noiseless channel, the Nyquist bit rate formula defines the theoretical maximum bit rate.",
            "For a noisy channel, we need the Shannon capacity to find the maximum bit rate.",
            "Attenuation, distortion and noise can impair a signal.",
          ],
        },
        {
          type: "p",
          text: "The module forms one connected argument. Data must become a signal, and the signal lives in both the time and frequency domains; a sine wave is described by amplitude, frequency and phase, and everything else is built from sums of sine waves. Whatever the medium, the received signal is weaker (attenuation), possibly deformed (distortion), and always accompanied by noise. Those impairments set the two ceilings: Nyquist for the noiseless ideal and Shannon for the noisy reality. Above those ceilings sit the operational measures the user actually feels — throughput, latency and jitter.",
        },
        {
          type: "table",
          head: ["Concept", "Formula", "Units", "What it tells you"],
          rows: [
            ["Period and frequency", "T = 1/f", "s, Hz", "How long one cycle takes and how many occur per second"],
            ["Wavelength", "λ = c/f", "m", "How much space one cycle occupies in the medium"],
            ["Bandwidth", "B = f_high − f_low", "Hz", "Width of the frequency interval occupied"],
            ["Bits per level", "n = log2 L", "bits", "How much information one signal level carries"],
            ["Decibel", "dB = 10 log10(P2/P1)", "dB", "Relative power gain or loss between two points"],
            ["Signal-to-noise ratio", "SNR = P_signal / P_noise; SNRdB = 10 log10(SNR)", "none, dB", "How much cleaner the signal is than the noise"],
            ["Nyquist bit rate", "BitRate = 2 B log2 L", "bps", "Maximum rate on a noiseless channel"],
            ["Shannon capacity", "C = B log2(1 + SNR)", "bps", "Maximum rate on a noisy channel"],
            ["Propagation time", "distance / propagation speed", "s", "Time for energy to travel the medium"],
            ["Transmission time", "message size / bandwidth", "s", "Time to clock the bits out"],
          ],
        },
        {
          type: "note",
          text: "Final check before the exam: every dB question reduces to a power ratio; every capacity question asks whether the channel is noiseless (Nyquist) or noisy (Shannon); every latency question asks whether distance or bandwidth dominates. Get those three decisions right and the arithmetic follows.",
        },
      ],
    },
  ],
  flashcards: [
    { q: "Which layer of the OSI model transmits bits over the medium?", a: "The physical layer — the lowest layer. It transmits bit sequences through the medium to the physical layer of the remote node, where frames are reconstructed and passed up to the data link layer.", sec: "s1" },
    { q: "Name the four kinds of physical-layer specification details.", a: "Mechanical (cable and connector types), electrical (voltage levels, data rate, distance), functional (what each pin or circuit does) and procedural (the sequence of events for a transfer).", sec: "s1" },
    { q: "What is the difference between an analog and a digital signal?", a: "An analog signal has infinitely many levels of intensity over a period of time. A digital signal can have only a limited number of defined values — it jumps between discrete levels.", sec: "s2" },
    { q: "Define a periodic signal and its period.", a: "A periodic signal has a repeating pattern within a time frame; that time frame is the period. It repeats identically over subsequent periods, and completing one full pattern is one cycle.", sec: "s2" },
    { q: "What three parameters describe a sine wave?", a: "Amplitude, frequency and phase. Amplitude is the absolute value of the highest intensity; frequency is the number of periods in one second; phase describes the waveform's position relative to time zero.", sec: "s3" },
    { q: "Give the relations between period and frequency.", a: "T = 1/f, f = 1/T, and the time to complete one cycle = 1/f. If 4 cycles fit in 1 second, f = 4 Hz and T = 0.25 s.", sec: "s3" },
    { q: "What units is phase measured in?", a: "Degrees or radians. A quarter-cycle shift is 90°, a half-cycle shift is 180°, and a full cycle is 360° (2π radians).", sec: "s3" },
    { q: "State the wavelength formula and what it links.", a: "λ = c/f = c·T. Wavelength binds the period or frequency of a simple sine wave to the propagation speed of the medium, and is measured in metres.", sec: "s4" },
    { q: "What is the wavelength of red light at 4 × 10¹⁴ Hz in free space?", a: "λ = (3 × 10⁸) / (4 × 10¹⁴) = 0.75 × 10⁻⁶ m = 0.75 µm.", sec: "s4" },
    { q: "What did Fourier show about composite signals?", a: "That a composite signal is a combination of simple sine waves with different frequencies, amplitudes and phases. Composite signals may be periodic or non-periodic.", sec: "s5" },
    { q: "How is the bandwidth of a composite signal defined?", a: "As the range of frequencies contained in the signal — normally expressed as the difference between the highest and lowest frequency: B = f_high − f_low.", sec: "s5" },
    { q: "If a signal has L levels, how many bits does each level carry?", a: "log2 L bits per level. Two levels carry 1 bit, four levels carry 2 bits, eight levels carry 3 bits, sixteen levels carry 4 bits.", sec: "s6" },
    { q: "Distinguish bit rate from bit interval.", a: "Bit rate is the number of bits sent in one second (bps). Bit interval is the time one bit occupies (1 / bit rate), or spatially the distance one bit occupies on the medium. At 1 Mbps the bit interval is 1 µs.", sec: "s6" },
    { q: "What is baseband transmission?", a: "Sending a digital signal over a channel without changing it into an analog signal. It needs a low-pass, wide-bandwidth dedicated medium — the digital signal is placed on the medium as-is.", sec: "s7" },
    { q: "What does modulation let a broadband system do?", a: "It changes the digital signal into an analog signal so a bandpass channel can be used — a channel whose bandwidth does not start from zero, such as radio, DSL or cable-data spectrum.", sec: "s7" },
    { q: "Three impairments a signal suffers in a medium?", a: "Attenuation (loss of energy), distortion (change of form or shape) and noise (unwanted energy added by the channel). Noise types include thermal, induced, crosstalk and impulse.", sec: "s8" },
    { q: "Give the decibel formula and sign convention.", a: "dB = 10 log10(P2/P1). It is negative if the signal is attenuated and positive if the signal is amplified. Halving the power is about −3 dB; doubling is about +3 dB.", sec: "s8" },
    { q: "A signal's power is reduced to one-half. What is the attenuation in dB?", a: "dB = 10 log10(1/2) = 10 × (−0.301) = −3.01 dB, conventionally quoted as −3 dB.", sec: "s8" },
    { q: "What causes distortion and why does it matter?", a: "Distortion means the signal changes its form or shape. It occurs in composite signals when components of different frequencies arrive at different times because of different propagation speeds per frequency — the waveform is deformed even though power may be unchanged.", sec: "s9" },
    { q: "Name the four types of noise and their sources.", a: "Thermal — random motion of electrons in a wire. Induced — motors and appliances acting as a sending antenna while the medium acts as a receiving antenna. Crosstalk — signals jumping between adjacent wires. Impulse — spikes from power lines, lightning and the like.", sec: "s9" },
    { q: "Define SNR and SNRdB.", a: "SNR is the ratio of what is wanted (signal power) to what is not wanted (noise power): SNR = P_signal / P_noise. SNRdB = 10 log10(SNR). A high SNR means the signal is less corrupted by noise.", sec: "s10" },
    { q: "Signal power 10 mW, noise power 1 µW. Find SNR and SNRdB.", a: "SNR = 10⁻² / 10⁻⁶ = 10,000. SNRdB = 10 log10(10,000) = 40 dB.", sec: "s10" },
    { q: "On what three factors does data rate depend?", a: "The bandwidth available, the level of the signals we use, and the quality of the channel (the level of noise).", sec: "s11" },
    { q: "State the Nyquist bit rate formula and its condition.", a: "BitRate = 2 × B × log2 L, where B is the channel bandwidth in hertz and L the number of signal levels. It applies to a noiseless channel and assumes no noise at all.", sec: "s11" },
    { q: "A 3000 Hz noiseless channel uses two levels. What is the data rate?", a: "BitRate = 2 × 3000 × log2 2 = 2 × 3000 × 1 = 6000 bps = 6 kbps.", sec: "s11" },
    { q: "State Shannon's capacity formula and what it depends on.", a: "C = B × log2(1 + SNR), where B is bandwidth in hertz and SNR is the plain power ratio. It depends only on bandwidth and SNR — signal levels do not appear, so levels do not dictate the capacity.", sec: "s12" },
    { q: "Find the Shannon capacity of a 3000 Hz telephone line with SNR 3162.", a: "C = 3000 × log2(3163) ≈ 3000 × 11.627 ≈ 34,881 bps ≈ 34.9 kbps. That SNR corresponds to about 35 dB.", sec: "s12" },
    { q: "Channel bandwidth 1 MHz, SNR 63. What is the capacity and the level count for 4 Mbps?", a: "Capacity = 1 × 10⁶ × log2(64) = 6 Mbps, the upper limit. Using 4 Mbps for better performance, Nyquist gives 4 × 10⁶ = 2 × 10⁶ × log2 L, so log2 L = 2 and L = 4 levels.", sec: "s12" },
    { q: "Distinguish bandwidth from throughput.", a: "Bandwidth is the theoretical capacity of a link, in hertz or bits per second. Throughput is how fast data can actually be sent through the network. A link of bandwidth B delivers throughput T with T always less than B.", sec: "s13" },
    { q: "What four terms make up latency?", a: "Propagation time + transmission time + queuing time + processing delay. Latency is how long it takes for an entire message to arrive at the destination from the moment the first bit is sent.", sec: "s13" },
    { q: "Give the formulas for propagation time and transmission time.", a: "Propagation time = Distance / Propagation Speed. Transmission time = Message size / Bandwidth.", sec: "s13" },
    { q: "2.5-KB message over 1 Gbps across 12,000 km at 2.4 × 10⁸ m/s. Find both times.", a: "Propagation = (12,000 × 1000)/(2.4 × 10⁸) = 0.05 s = 50 ms. Transmission = (2500 × 8)/10⁹ = 0.00002 s = 0.020 ms.", sec: "s13" },
    { q: "What is jitter?", a: "The difference in delay or latency per packet — the variation in arrival time from packet to packet. Streaming media is sensitive to jitter and buffers packets to smooth it out.", sec: "s13" },
    { q: "Why does the slides' summary say a digital signal has infinite bandwidth?", a: "Because a digital (square-ish) signal is a composite analog signal built from infinitely many harmonics. Perfect sharp edges would require every frequency, so the theoretical bandwidth is infinite.", sec: "s14" },
    { q: "Which formula applies to a noiseless channel and which to a noisy one?", a: "Nyquist's bit rate formula (BitRate = 2 B log2 L) applies to a noiseless channel; Shannon's capacity (C = B log2(1 + SNR)) applies to a noisy channel and is the one to use when noise is a factor.", sec: "s14" },
  ],
  quiz: [
    {
      q: "Which statement best describes the physical layer's job in the OSI model?",
      choices: [
        "It regulates the format and sequencing of frames between adjacent nodes",
        "It transmits bit sequences through the network medium to the physical layer of the remote node",
        "It provides end-to-end reliable delivery and flow control between processes",
        "It selects routes across the internetwork using addressing information",
      ],
      answer: 1,
      why: "The physical layer is the lowest OSI layer and is responsible for transmitting bit sequences through the network medium to the physical layer of the remote node, where frames are reconstructed and passed to the data link layer.",
      sec: "s1",
    },
    {
      q: "Which set of details belongs to a physical-layer specification?",
      choices: [
        "Frame boundaries, sequence numbers and acknowledgements",
        "Port numbers, session state and encryption keys",
        "Cable and connector types, the electrical signals on each pin, and how bit values become physical signals",
        "Subnet masks, routing tables and logical addresses",
      ],
      answer: 2,
      why: "The slides state that physical layer specifications include the type of cable and connectors used, the electrical signals associated with each pin and connector, and the manner in which bit values are converted into physical signals — for both wired and wireless environments.",
      sec: "s1",
    },
    {
      q: "An analog signal is best described as one that:",
      choices: [
        "has exactly two defined values that switch instantly",
        "has infinitely many levels of intensity over a period of time",
        "repeats every fixed number of nanoseconds",
        "always carries exactly one bit at a time",
      ],
      answer: 1,
      why: "The slide definition is that an analog signal has infinitely many levels of intensity over a period of time, whereas a digital signal can have only a limited number of defined values.",
      sec: "s2",
    },
    {
      q: "A signal repeats its pattern every 0.2 s. What is its frequency?",
      choices: ["0.2 Hz", "2 Hz", "5 Hz", "20 Hz"],
      answer: 2,
      why: "Frequency is the reciprocal of the period: f = 1/T = 1/0.2 = 5 Hz. Period and frequency are inverses, so a short period means a high frequency.",
      sec: "s3",
    },
    {
      q: "A sine wave is described by which three parameters?",
      choices: [
        "Amplitude, frequency and phase",
        "Bit rate, bandwidth and throughput",
        "Voltage, current and resistance",
        "Period, wavelength and jitter",
      ],
      answer: 0,
      why: "The slides state that a sine wave can be represented by three parameters: frequency, amplitude and phase. Wavelength and period are derived from these rather than being independent descriptors.",
      sec: "s3",
    },
    {
      q: "Phase is measured in:",
      choices: ["hertz", "degrees or radians", "seconds", "metres"],
      answer: 1,
      why: "Phase, or phase shift, describes the position of the waveform relative to time zero and is measured in degrees or radians — a quarter cycle is 90°, a half cycle 180°, a full cycle 360°.",
      sec: "s3",
    },
    {
      q: "Red light has a frequency of 4 × 10¹⁴ Hz and propagates in free space at 3 × 10⁸ m/s. What is its wavelength?",
      choices: ["0.75 µm", "1.33 µm", "0.75 nm", "7.5 mm"],
      answer: 0,
      why: "λ = c/f = (3 × 10⁸)/(4 × 10¹⁴) = 0.75 × 10⁻⁶ m = 0.75 µm. The 0.75 nm option confuses the exponent; 7.5 mm confuses the magnitude of the division.",
      sec: "s4",
    },
    {
      q: "A composite signal contains frequencies from 300 Hz to 3300 Hz. What is its bandwidth?",
      choices: ["3300 Hz", "300 Hz", "3000 Hz", "3600 Hz"],
      answer: 2,
      why: "Bandwidth is the difference between the two numbers: 3300 − 300 = 3000 Hz. The highest frequency alone (3300 Hz) is not the bandwidth, and the sum of the two is meaningless here.",
      sec: "s5",
    },
    {
      q: "A digital signal uses 8 signal levels. How many bits does each level carry?",
      choices: ["2 bits", "3 bits", "4 bits", "8 bits"],
      answer: 1,
      why: "If a signal has L levels, each level needs log2 L bits. log2 8 = 3, so eight levels carry three bits per symbol.",
      sec: "s6",
    },
    {
      q: "A link runs at 500 kbps. What is the bit interval?",
      choices: ["2 µs", "0.5 µs", "2 ms", "500 µs"],
      answer: 0,
      why: "Bit interval = 1 / bit rate = 1 / 500,000 s = 2 × 10⁻⁶ s = 2 µs. Dividing instead of taking the reciprocal, or sliding a factor of 1000, produces the other options.",
      sec: "s6",
    },
    {
      q: "What is the essential difference between baseband and broadband transmission?",
      choices: [
        "Baseband uses fibre while broadband uses copper",
        "Baseband sends the digital signal as-is over a low-pass channel; broadband modulates it to analog for a bandpass channel",
        "Baseband is analogue while broadband is digital",
        "Baseband is always wireless while broadband is always wired",
      ],
      answer: 1,
      why: "Baseband transmission sends a digital signal over a channel without changing it to an analog signal, needing a wide-bandwidth low-pass medium. Broadband transmission changes the digital signal to analog so modulation can use a bandpass channel that does not start at zero.",
      sec: "s7",
    },
    {
      q: "A signal's power drops to one quarter of its original value. What is the change in decibels?",
      choices: ["−3 dB", "−6 dB", "−12 dB", "−0.6 dB"],
      answer: 1,
      why: "dB = 10 log10(1/4) = 10 × (−0.602) = −6.02 dB ≈ −6 dB. Halving the power is −3 dB, so halving twice gives −6 dB; the minus sign indicates attenuation.",
      sec: "s8",
    },
    {
      q: "Which noise type comes from motors and appliances acting as a sending antenna while the medium acts as a receiving antenna?",
      choices: ["Thermal noise", "Induced noise", "Crosstalk", "Impulse noise"],
      answer: 1,
      why: "The slide defines induced noise as coming from sources such as motors and appliances which act as a sending antenna while the medium acts as a receiving antenna. Crosstalk is coupling between adjacent wires, and impulse noise is a spike from power lines or lightning.",
      sec: "s9",
    },
    {
      q: "Which noise type is described as a spike coming from power lines and lightning?",
      choices: ["Thermal noise", "Induced noise", "Crosstalk", "Impulse noise"],
      answer: 3,
      why: "Impulse noise is defined on the slide as a spike that comes from power lines, lightning and the like. It is short in duration but high in amplitude, which is why it can corrupt a burst of adjacent bits.",
      sec: "s9",
    },
    {
      q: "The power of a signal is 10 mW and the noise power is 1 µW. What are SNR and SNRdB?",
      choices: ["SNR = 10, SNRdB = 10 dB", "SNR = 10,000, SNRdB = 40 dB", "SNR = 1,000, SNRdB = 30 dB", "SNR = 10,000, SNRdB = 4 dB"],
      answer: 1,
      why: "10 mW = 10⁻² W and 1 µW = 10⁻⁶ W, so SNR = 10⁻²/10⁻⁶ = 10,000. Then SNRdB = 10 log10(10,000) = 40 dB. The 4 dB option forgets to multiply the logarithm by ten.",
      sec: "s10",
    },
    {
      q: "A noiseless channel has a bandwidth of 3000 Hz and uses two signal levels. What is the theoretical data rate?",
      choices: ["1500 bps", "3000 bps", "6000 bps", "12000 bps"],
      answer: 2,
      why: "Nyquist gives BitRate = 2 × B × log2 L = 2 × 3000 × log2 2 = 2 × 3000 × 1 = 6000 bps. Dropping the factor of 2 gives 3000 bps; using four levels would give 12000 bps.",
      sec: "s11",
    },
    {
      q: "A 4000 Hz noiseless channel uses 8 signal levels. What is the maximum bit rate?",
      choices: ["12 kbps", "24 kbps", "32 kbps", "48 kbps"],
      answer: 1,
      why: "BitRate = 2 × 4000 × log2 8 = 2 × 4000 × 3 = 24,000 bps = 24 kbps. Using log2 8 = 4 by mistake yields 32 kbps, a common slip.",
      sec: "s11",
    },
    {
      q: "Which quantity is deliberately absent from Shannon's capacity formula?",
      choices: [
        "The bandwidth of the channel",
        "The signal-to-noise ratio",
        "The number of signal levels",
        "The channel capacity in bits per second",
      ],
      answer: 2,
      why: "The slide notes there is no indication of the signal level in Shannon's formula, meaning the levels of the signal do not dictate the capacity of the channel. Capacity depends only on bandwidth and SNR.",
      sec: "s12",
    },
    {
      q: "A 3000 Hz telephone line has an SNR of 3162. What is the theoretical capacity?",
      choices: ["about 3 kbps", "about 9.5 kbps", "about 34.9 kbps", "about 3162 bps"],
      answer: 2,
      why: "C = B log2(1 + SNR) = 3000 × log2(3163) ≈ 3000 × 11.627 ≈ 34,881 bps, about 34.9 kbps. Multiplying by the plain SNR instead of its logarithm gives wild overestimates.",
      sec: "s12",
    },
    {
      q: "A channel has 1 MHz bandwidth and SNR 63. If the design rate is 4 Mbps, how many signal levels does Nyquist require?",
      choices: ["2 levels", "4 levels", "8 levels", "16 levels"],
      answer: 1,
      why: "Nyquist: 4 × 10⁶ = 2 × 10⁶ × log2 L, so log2 L = 2 and L = 2² = 4 levels. The channel's Shannon ceiling is 6 Mbps; the design deliberately uses 4 Mbps for better performance.",
      sec: "s12",
    },
    {
      q: "A link has a bandwidth of 100 Mbps but only 40 Mbps of data actually gets through. What is the 40 Mbps called?",
      choices: ["Bandwidth", "Throughput", "Latency", "Jitter"],
      answer: 1,
      why: "Throughput is a measure of how fast we can actually send data through a network. A link may have bandwidth B but can only send throughput T, with T always less than B because of overhead, contention and other factors.",
      sec: "s13",
    },
    {
      q: "Which of the following is NOT one of the four terms that make up latency?",
      choices: ["Propagation time", "Transmission time", "Queuing time", "Wavelength"],
      answer: 3,
      why: "Latency = propagation time + transmission time + queuing time + processing delay. Wavelength is a spatial property of a signal in a medium, not a component of delay.",
      sec: "s13",
    },
    {
      q: "A 2.5-KB message crosses 12,000 km on a 1 Gbps link at a propagation speed of 2.4 × 10⁸ m/s. What are the propagation and transmission times?",
      choices: [
        "50 ms and 0.020 ms",
        "0.020 ms and 50 ms",
        "20 ms and 0.05 ms",
        "5 ms and 0.2 ms",
      ],
      answer: 0,
      why: "Propagation time = (12,000 × 1000)/(2.4 × 10⁸) = 0.05 s = 50 ms. Transmission time = (2500 × 8)/10⁹ = 0.00002 s = 0.020 ms. Distance, not bandwidth, dominates this link.",
      sec: "s13",
    },
    {
      q: "Which statement about the module's summary is correct?",
      choices: [
        "A digital signal is a composite analog signal with a finite bandwidth equal to its bit rate",
        "A digital signal is a composite analog signal with an infinite bandwidth",
        "Digital signals are always periodic and analog signals always aperiodic",
        "Attenuation and noise improve the signal-to-noise ratio",
      ],
      answer: 1,
      why: "The summary states that a digital signal is a composite analog signal with an infinite bandwidth, because perfect edges require infinitely many harmonics. The other options contradict the slide's summary points.",
      sec: "s14",
    },
  ],
});
