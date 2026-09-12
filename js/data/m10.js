window.NSCOM_MODULES = window.NSCOM_MODULES || [];
window.NSCOM_MODULES.push({
  id: "m10",
  num: 10,
  title: "Microwave Oven Interference & Wi-Fi",
  accent: "#d98cff",
  icon: `<svg viewBox="0 0 32 32" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="17" height="13" rx="2"/><rect x="4.5" y="9.5" width="9" height="8" rx="1"/><path d="M15.5 11.5h1" opacity=".7"/><path d="M15.5 15.5h1" opacity=".7"/><path d="M11.5 13.5c1.2-1.2 3.2-1.2 4.4 0s1.2 2.4 0 3.6" stroke-width="1.3" opacity=".75"/><path d="M21.5 23.5a4.5 4.5 0 0 1 4.5-4.5"/><path d="M21.5 27.5a8.5 8.5 0 0 1 8.5-8.5"/></svg>`,
  summary:
    "Unlicensed devices share spectrum, and the most famous unintended sharer is the residential microwave oven (MWO). This module reads a required course paper — Taher, Misurac, LoCicero and Ucci, 'Microwave Oven Signal Interference Mitigation for Wi-Fi Communication Systems' (Illinois Institute of Technology) — alongside the underlying theory of the 2.4 GHz ISM band, magnetron emission, the 50/60 Hz half-wave duty-cycle signature that makes MWO pollution bursty and periodic, IEEE 802.11 CSMA/CA's helplessness against an interferer that never listens, Barker-code spread spectrum, a cognitive-radio mitigation scheme that senses MWO transients and transmits only during OFF cycles, and BER as the performance yardstick. The paper's measured numbers (BER up to 0.1129 with no mitigation, 0.000000 with mitigation, and the 100% to 50% data-rate trade) are treated as reported results, clearly separated from general data-communications explanation.",
  sections: [
    {
      id: "s1",
      title: "The Paper This Module Is Built On",
      body: [
        {
          type: "fig",
          fig: "m10-p01-microwave-oven-signal-interference-m",
          caption: "Paper front page: microwave oven signal interference mitigation for Wi-Fi communication systems (Taher, Misurac, LoCicero and Ucci).",
        },
        {
          type: "list",
          items: [
            "This module comes from a **research paper**, not lecture slides — hence the continuous prose.",
            "Authors: **Taher, Misurac, LoCicero, Ucci** (Illinois Institute of Technology).",
            "Claim: a **microwave oven is an unintentional interferer** for 2.4 GHz Wi-Fi, and a **cognitive-radio** technique can mitigate it.",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "what the paper claims",
          body: [
            {
              type: "p",
              text: "Unlike the earlier modules in this reviewer, which are built from lecture slides, this module is built from a research paper — which is why the text reads as continuous prose rather than bullets. The required reading is 'Microwave Oven Signal Interference Mitigation for Wi-Fi Communication Systems' by Tanim M. Taher, Matthew J. Misurac, Joseph L. LoCicero and Donald R. Ucci of the Department of Electrical and Computer Engineering at the Illinois Institute of Technology. It is an IEEE conference paper published in the IEEE CCNC 2008 proceedings.",
            },
            {
              type: "list",
              items: [
                "Authors: T. M. Taher, M. J. Misurac, J. L. LoCicero, D. R. Ucci — Illinois Institute of Technology, Chicago, IL.",
                "Abstract claim: the MicroWave Oven (MWO) is a popular appliance that acts as an unintentional interferer for 2.4 GHz IEEE 802.11 Wi-Fi signals.",
                "Contribution 1: an interference mitigation technique built on cognitive radio paradigms that lets Wi-Fi devices transmit reliably while a residential MWO is operating.",
                "Contribution 2: application of that technique to the experimental case where Barker spread Wi-Fi signals carry data in the presence of MWO emissions.",
                "Performance metric: bit error rate (BER).",
                "Acknowledgement: the work was partially supported by the National Science Foundation under contract no. NSF-CNS 0520232.",
              ],
            },
            {
              type: "p",
              text: "Three references do most of the supporting work in the paper and are worth knowing by name because they are where its prior claims come from. Reference [3] is the authors' own earlier paper, Taher, Al-Banna, LoCicero and Ucci, 'Characteristics of an Unintentional Wi-Fi Interference Device — The Residential Microwave Oven', Proc. IEEE Military Communications Conference, Oct. 2006, which is where the MWO signal description and a feasible alternate mitigation technique were first outlined. Reference [4] is Rappaport's Wireless Communications Principles and Practices, the standard source the paper cites for Carrier Sense Multiple Access. Reference [2] is IEEE Standard 802.11, the Wireless LAN Medium Access Control (MAC) and Physical Layer Specifications, June 1997.",
            },
            {
              type: "note",
              text: "Attribution discipline matters in this module. Wherever you see 'the paper reports', 'the paper found' or 'the paper's conclusion', the statement comes from Taher et al. Everything else is standard data-communications explanation added for depth, and is not attributed to those authors.",
            },
          ],
        },
      ],
    },
    {
      id: "s2",
      title: "The 2.4 GHz ISM Band and Why Unlicensed Devices Share It",
      body: [
        {
          type: "list",
          items: [
            "The **2.4 GHz ISM band** is **unlicensed** — that is why consumer devices crowd into it.",
            "The band was allocated in **1947** at the ITU conference in Atlantic City, long **before** Wi-Fi existed.",
            "So Wi-Fi was the newcomer here: microwave heating had the band first.",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "why the band is unlicensed",
          body: [
            {
              type: "p",
              text: "The paper opens by observing that the unlicensed Industrial, Scientific and Medical (ISM) bands are very attractive for consumer applications. The attraction is regulatory, not technical: a device sold in an ISM band does not need an individual operator licence, so a manufacturer can ship millions of units without coordinating with a national regulator. The price is that the band is a commons. Nobody owns it, nobody controls admissions to it, and therefore nobody can guarantee that interference will not arrive.",
            },
            {
              type: "p",
              text: "The band's name is a leftover from its origin. In 1947, at the International Telecommunication Union conference in Atlantic City, the ITU allocated 2.4 GHz as the 2.4 GHz ISM band specifically for industrial, scientific and medical equipment. The original intent was that these bands carried interference-generating and interference-sensitive equipment in the same service, and the regulatory bargain was simple: such equipment could radiate freely provided that the operator accepted whatever interference resulted and it caused no harmful interference to licensed radio services. 'Industrial' was for microwave heating and welding; 'scientific' covered laboratory equipment such as diathermy machines; 'medical' covered appliances like microwave ovens and MRI gradient drivers.",
            },
            {
              type: "p",
              text: "Wi-Fi was therefore a squatter on a band that already belonged to microwave heating, and today the reverse is emotionally true — most people think of 2.4 GHz as 'the Wi-Fi band'. The paper names the exact tenant list of 2.4 GHz that a residential user actually encounters: IEEE 802.11 Wi-Fi access points, wireless laptops, Bluetooth devices and cordless phones. Every one of those devices is designed to share politely, with listen-before-talk and limited transmit power. The MWO, as the next section explains, was not designed to share at all.",
            },
            {
              type: "table",
              head: ["Band", "Range", "Claim on the spectrum"],
              rows: [
                ["2.4 GHz ISM", "2.400–2.4835 GHz", "Unlicensed; 802.11b/g, Bluetooth, cordless phones, MWO leakage"],
                ["5 GHz UNII", "5.15–5.85 GHz", "Unlicensed; 802.11a/n/ac, fewer legacy interferers"],
                ["2.4 GHz ISM origin", "1947 ITU allocation", "Industrial, scientific and medical heating and instrumentation equipment first"],
              ],
            },
            {
              type: "p",
              text: "The 2.4 GHz band is only about 83.5 MHz wide in most of the world. That is the whole commons for a vast population of devices, which is why the band is congested and why clever use of it matters so much. The paper's MWO signal occupies a large fraction of that width — up to 60 MHz of it according to the paper — which is the crux of the problem: the interferer is not a narrow tone that could be filtered out but a wide swath of energy sitting right on top of a Wi-Fi channel.",
            },
            {
              type: "note",
              text: "Exam tip: 'unlicensed' does not mean unregulated. ISM devices must still meet power limits, bandwidth limits and an obligation not to cause harmful interference to licensed services. It means 'no individual licence needed', so interference among unlicensed users is their own problem to solve.",
            },
          ],
        },
      ],
    },
    {
      id: "s3",
      title: "The Microwave Oven as an Unintentional Interferer",
      body: [
        {
          type: "fig",
          fig: "m10-p02-fig-3-case-1-no-mitigation",
          caption: "Paper figure: Case 1 spectrogram — Wi-Fi transmitted at 2.46 GHz with no mitigation, inside the MWO's AM-FM region.",
        },
        {
          type: "list",
          items: [
            "An **unintentional interferer** is a device designed **neither to radiate nor receive** radio energy — it just leaks.",
            "Contrast with every Wi-Fi device, which is an **intentional** radiator following the rules.",
            "This distinction is the paper's whole framing: the MWO **cannot be made to cooperate**.",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "intentional vs not",
          body: [
            {
              type: "p",
              text: "The paper's headline framing is that the MicroWave Oven (MWO) is an unintentional interferer. Contrast that with every other device in the 2.4 GHz band. A Wi-Fi access point, a Bluetooth headset and a cordless phone are all intentional radiators: they contain a radio transmitter whose entire purpose is to put modulated energy into the air, and they are designed with that burden in mind. A microwave oven contains no radio at all. It contains a magnetron, which is a high-power vacuum tube oscillator built to convert electrical power into heat, and the radio emissions that escape it are an unwanted by-product of a badly imperfectly shielded cavity.",
            },
            {
              type: "p",
              text: "By convention, an unintentional radiator is a device that is designed neither to radiate nor to receive radio energy and that does not intentionally generate radio frequency energy for... well, for radio purposes. Equipment of that class is held to limits on the energy it may emit, but it is never expected to cooperate with anyone. That is precisely the paper's point about CSMA: the MWO is oblivious to interference avoidance. It will not wait for a clear channel, will not back off, will not respond to a jam signal and cannot be told to quiet down. It simply does what its power supply and its cooking load make it do.",
            },
            {
              type: "note",
              text: "The phrase to remember is 'unintentional'. It turns the whole mitigation strategy on its head. You cannot negotiate with an interferer that has no receiver, so instead of sharing the channel you must steer around the interferer in time — which is exactly what the paper's cognitive radio does.",
            },
          ],
        },
      ],
    },
    {
      id: "s4",
      title: "Inside the MWO: the Magnetron and the 2.45 GHz Choice",
      body: [
        {
          type: "list",
          items: [
            "A microwave oven heats by **dielectric heating** — water molecules are **electric dipoles** that flip with the field.",
            "**~2.45 GHz** is a compromise between how well water absorbs the energy and how evenly it penetrates.",
            "The **magnetron** is the tube that generates the field.",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "dielectric heating",
          body: [
            {
              type: "h3",
              text: "Why microwave heating needs a high frequency",
            },
            {
              type: "p",
              text: "A microwave oven heats food by dielectric heating. The target is water, whose molecule is an electric dipole: the oxygen end carries a partial negative charge and the two hydrogen ends carry partial positive charges. When an alternating electric field is applied, these dipoles try to align with the field, and every reversal of the field flips them. The molecules rotate back and forth, collide with their neighbours and convert field energy into molecular agitation — which is heat. The rate at which a dipole can follow the field is limited by how fast it can rotate in a viscous medium, so the effect is maximised at microwave frequencies rather than at, say, 50 Hz.",
            },
            {
              type: "p",
              text: "The industrial choice of roughly 2.45 GHz is a compromise between how well the water absorbs the field and how uniformly the energy penetrates the food. The commonly quoted industrial reason is that 2.45 GHz falls in an ISM band, so a manufacturer can use it without a special radio licence — the same regulatory bargain described in the last section. The paper's abstract and introduction simply state the consequence: the MWO radiates in 'this frequency band', the 2.4 GHz ISM band, and interferes with Wi-Fi communications.",
            },
            {
              type: "h3",
              text: "How the magnetron produces the power",
            },
            {
              type: "p",
              text: "The energy source inside the oven is a cavity magnetron. It is a diode-like vacuum tube with a cylindrical cathode in the middle and an anode block around it, the anode being a ring of resonant cavities that act as a set of coupled microwave resonators. A high DC voltage applied between cathode and anode drives electrons radially outward, and an axial magnetic field, supplied by permanent magnets, curves their paths; the interaction between the spinning electron cloud and the resonant cavities causes the electrons to bunch into spokes and to give up energy to the fields of the cavities. The result is continuous-wave oscillation in the 2.45 GHz range, delivered through a waveguide into the cooking cavity. Household magnetrons typically deliver hundreds of watts of microwave power — commonly in the 600–1000 W range — and the loss mechanism that matters here is that the door seal, the viewing mesh and the waveguide entry suppress the radiation by only a finite amount.",
            },
            {
              type: "note",
              text: "Two terms to keep straight. The magnetron is the source; the cavity that holds the food is the load. Leakage through the door seal is a small fraction of the tube's output, but because the tube's output is hundreds of watts, even a tiny fraction is enormous compared with the power a Wi-Fi transmitter is allowed to radiate, and the receiver suffering from it may be only a metre away.",
            },
          ],
        },
      ],
    },
    {
      id: "s5",
      title: "The 50/60 Hz Signature: Bursty, Periodic, Predictable",
      body: [
        {
          type: "list",
          items: [
            "The MWO signal is **wideband (up to 60 MHz)**, **periodic**, and **synchronised to the AC mains**.",
            "The **magnetron supply is half-wave rectified**, so emission is chopped at **twice the mains frequency — 100 Hz (50 Hz mains) or 120 Hz (60 Hz)**.",
            "This is the module's most useful fact: **the interference is predictable in time**.",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "the 50/60 Hz signature",
          body: [
            {
              type: "p",
              text: "Here is the single most useful fact in the whole module, and it comes straight from the paper. The MWO signal is a wideband signal, up to 60 MHz wide, and it is periodic, synchronised to the 60 Hz AC line cycle. The paper states that the main characteristics of the MWO signal are the ON-OFF duty cycle, transients, and frequency sweep, and that they are seen in Fig. 1 of the paper. It further notes that the 'ON' cycle is less than half of the 0.017 s 60 Hz period. That one observation converts an apparently random nuisance into a deterministic, time-slotted interference source that a transmitter can plan around.",
            },
            {
              type: "p",
              text: "Why is the emission chopped at twice the mains frequency in the first place? Because the magnetron's anode supply is produced by a typical half-wave rectifier fed from the mains transformer. The magnetron oscillates only while its anode-to-cathode voltage exceeds the tube's threshold — roughly the several kilovolts needed to start oscillation. With half-wave rectification, current flows for something under half of each 60 Hz mains cycle: the tube conducts around the peak of one half-cycle, then stays off through the rest. Since a mains cycle is 60 per second and each frame contains one such conduction burst, the modulation envelope is a train of pulses repeating at 50 Hz or 60 Hz (or occasionally 100 Hz or 120 Hz if full-wave rectification is used) — with the rest of the period silent.",
            },
            {
              type: "formula",
              tex: "T_{line} = \\frac{1}{f_{line}} = \\frac{1}{60\\,\\text{Hz}} \\approx 0.0167\\,\\text{s}",
              text: "The AC line period is one divided by the line frequency; at 60 Hz this is about 0.0167 s, the 0.017 s the paper quotes. This is the interval at which the MWO's interference burst repeats, so it fixes the slot structure a cognitive radio can synchronise to. In a 50 Hz country the same reasoning gives 1/50 = 0.020 s.",
            },
            {
              type: "formula",
              tex: "f_{burst} = 2 f_{line}",
              text: "Because one pulse is produced per half-cycle of the sinusoidal supply, the burst repetition rate is twice the line frequency: 100 Hz for a 50 Hz line, 120 Hz for a 60 Hz line. The harmonic series that results is therefore at multiples of 120 Hz, which is why MWO interference appears in the frequency domain as a series of equally spaced lines rather than a smooth smudge.",
            },
            {
              type: "p",
              text: "Three practical consequences follow from this signature. First, the interference is not continuous: it is on for less than half the time, so a quarter to a half of every line cycle is essentially interference-free, and time is a resource. Second, it is periodic, so the silent windows recur at a known rate that can be predicted once the transmitter knows the line phase. Third, the bursts are accompanied by transients at the switching instants. The paper puts the expected transient time locations at 2 ms before or after the zero voltage crossings of the sinusoidal AC line reference. The zero crossings of a 60 Hz sine occur twice per 16.7 ms period, and the switching of the rectifier happens right around the moments the anode voltage crosses its conduction threshold — near those zero crossings. The narrow, predictable 2 ms window is the fingerprint the cognitive radio looks for.",
            },
            {
              type: "example",
              text: "The paper reports an ON segment shorter than half the 0.017 s line period and expects transients within 2 ms of the AC zero crossings. Work out what a designer gets from this: how long the OFF window is at best, how often transient windows occur, and what fraction of each 16.7 ms frame is available for data.",
              steps: [
                "Line frequency is 60 Hz, so the line period is 1/60 s ≈ 0.0167 s ≈ 16.7 ms, matching the 0.017 s the paper quotes.",
                "The paper says the ON cycle is less than half of that period, so ON is under 16.7/2 ≈ 8.35 ms and OFF is therefore more than about 8.35 ms.",
                "The AC line zero crossings occur twice per period, so there are two transient windows per 16.7 ms frame. Each window is ±2 ms wide around the crossing, giving 4 ms of 'expect a transient here' territory per crossing.",
                "The bursts are modulated at 2 × 60 = 120 Hz, so in a 1 s observation a listener sees about 120 distinct ON-OFF bursts and 120 potential transient windows.",
                "Conclusion: a transmitter that knows the line phase can free on the order of half the time for clean data, and it can do so without any coordination with the oven at all.",
              ],
            },
            {
              type: "table",
              head: ["Quantity", "Value", "Source"],
              rows: [
                ["MWO spectral width", "up to 60 MHz (wideband)", "the paper"],
                ["Line reference frequency", "60 Hz AC line", "the paper"],
                ["Line period", "0.017 s (= 1/60 s)", "the paper"],
                ["ON cycle length", "less than half the line period", "the paper"],
                ["Transient locations", "2 ms before or after AC zero crossings", "the paper"],
                ["Burst repetition", "2 × line frequency (half-wave rectification)", "standard theory"],
              ],
            },
          ],
        },
      
        {
          type: "viz",
          viz: "mwo-signature",
        },
      ],
    },
    {
      id: "s6",
      title: "The Spectral Signature: Frequency Sweep, AM-FM and Transients",
      body: [
        {
          type: "list",
          items: [
            "Three observed spectral characteristics: **ON-OFF duty cycle, transients, frequency sweep**.",
            "The **sweep** comes from the magnetron being a **free-running oscillator** — its frequency is pulled by the food's changing impedance.",
            "**AM** (from the half-wave supply) plus **FM** (the sweep) together smear the power across up to **60 MHz**.",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "sweep, AM and FM",
          body: [
            {
              type: "p",
              text: "The paper names the three characteristics it observed in the MWO spectrogram — ON-OFF duty cycle, transients and frequency sweep — and it identifies a region of the spectrum described as the 'AM-FM signal of the MWO'. The word 'signature' is used deliberately in the paper: the interference has a recognisable, repeatable form, and the mitigation system is built to detect that signature rather than to detect generic energy.",
            },
            {
              type: "p",
              text: "The frequency sweep comes from the loading of the magnetron. The tube is a free-running oscillator, not a crystal-locked one, and its oscillation frequency is pulled by the impedance presented to it. That impedance depends on the load in the cooking cavity: the mass of food, its water content, whether the turntable is turning, and the residual reflections from an unmatched cavity. Because the return loss is not constant across the ISM band and is not constant in time as the food heats and its permittivity changes, the magnetron's output frequency drifts and sweeps. The paper's observation that a Wi-Fi transmitter placed at 2.46 GHz sits inside the AM-FM region, where interference is high, is a direct consequence of this drift: a channel which is nominally clear of the MWO's nominal 2.45 GHz centre frequency is not clear in practice.",
            },
            {
              type: "p",
              text: "The AM part is the amplitude modulation from the half-wave supply, already analysed, and the FM part is the sweep. Together they smear the emitted power over a band of up to 60 MHz instead of concentrating it in one or two narrow lines. The FM sweep also produces intermodulation and spurious mixing that fills in the gaps between the main line components, so what the Wi-Fi receiver sees is not a clean set of tones that a narrowband notch filter could remove but a ragged noise floor spread across the band. This is what the paper's phrase 'high interference' describes in Case 1.",
            },
            {
              type: "p",
              text: "In the frequency domain the two modulations appear very differently. The periodic half-wave envelope at 100 or 120 Hz produces a line spectrum: sidebands spaced 100/120 Hz apart around the carrier, extending far out because the envelope is a tall narrow pulse with a low duty cycle. The slow FM sweep produces a broader, wandering spectral blob. A spectrogram — time horizontally, frequency vertically, power as brightness — shows both at once, which is why the paper's Fig. 1 is a spectrogram and why the mitigation concept is drawn directly on top of it.",
            },
            {
              type: "note",
              text: "If you are asked why a MWO does not simply occupy 2.45 GHz and nothing else: because its magnetron is a free-running oscillator whose frequency is pulled by the load, and because its supply chops the tube on and off. Amplitude modulation and frequency modulation both spread energy, and a spreading interferer cannot be filtered away — it can only be avoided in time or in code.",
            },
          ],
        },
      
        {
          type: "viz",
          viz: "mwo-signature",
        },
      ],
    },
    {
      id: "s7",
      title: "IEEE 802.11 in the Same Band and Why CSMA Fails Here",
      body: [
        {
          type: "list",
          items: [
            "802.11 puts its PHY and MAC in the **same 2.4 GHz band** — so the two systems collide.",
            "**CSMA works only if the other party plays by the rules.** The oven does not listen, so carrier sense is useless against it.",
            "The failure is **asymmetric and worse than a collision**: the station's frame may still reach the AP, so it cannot tell it failed.",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "why CSMA fails",
          body: [
            {
              type: "p",
              text: "IEEE 802.11, the Wi-Fi standard the paper cites as reference [2], puts its physical and medium-access layers in the 2.4 GHz ISM band in its original and 'b'/'g' variants. The medium-access method at the heart of 802.11 is Carrier Sense Multiple Access, cited in the paper through Rappaport's textbook. Distributed coordination in Wi-Fi is carried mainly by CSMA with collision avoidance: a station that wants to transmit must first sense the medium for a defined interframe gap, and if the medium is busy it defers; when the medium goes idle it waits a further random backoff interval before transmitting, so two stations that were both waiting do not start simultaneously. Acknowledgements and retransmissions then clean up the collisions that still slip through.",
            },
            {
              type: "p",
              text: "Phrased in the paper's terms: the CSMA protocol is effective in Wi-Fi collision avoidance, because the node it is negotiating with is a Wi-Fi node that plays by the same rules. The rule set is a mutual agreement — everyone senses, everyone respects the deferral, everyone backs off. The paper's criticism of the protocol is that the MWO is oblivious to this type of interference avoidance. It has no carrier-sense logic, no backoff and no MAC layer; it radiates whether or not a Wi-Fi frame is in progress. All of CSMA's machinery is therefore aimed at the wrong target.",
            },
            {
              type: "p",
              text: "The failure mode is asymmetric and worse than a simple collision. When a Wi-Fi station transmits while the MWO is bursting, the station's energy may still reach the access point, but the MWO's energy arrives at the receiver as well and corrupts the frame. The transmitter cannot hear this because the transmitter is closer to itself than to anybody else; it has no way to distinguish 'my frame was delivered' from 'my frame was destroyed by an oven'. The corruption is reported only indirectly, by the absence of an acknowledgement, and by then the transmitter has already repeated the mistake. The paper makes the connection to real-world behaviour explicit: in IEEE 802.11 systems high packet drop rates due to interference lead to Wi-Fi connection loss, citing reference [6]. From the user's point of view the symptoms are throughput collapse, video stalls, retransmissions and, in the worst case, a dropped association.",
            },
            {
              type: "p",
              text: "It is worth being precise about what does not happen. The MWO does not attack the Wi-Fi protocol; it attacks the physical layer, and it does so with far more power than any Wi-Fi device could legally radiate. CSMA/CA is a MAC-layer etiquette designed to arbitrate between courteous peers, and an unintentional radiator has neither MAC layer nor manners. This is exactly the situation the paper's mitigation technique is designed for, and it explains why the solution has to live in the physical layer — sensing the interference and controlling when the transmitter fires — rather than in any modification to the MAC protocol.",
            },
            {
              type: "note",
              text: "Exam tip: retransmission is not mitigation. Retrying a frame during the oven's whole ON window fails repeatedly; the only ways to win are to avoid the ON window in time (the paper's approach), to spread the signal so the receiver can dig it out, or to move to a different band such as 5 GHz.",
            },
          ],
        },
      ],
    },
    {
      id: "s8",
      title: "Spread Spectrum and the Barker Code: Textbook Background",
      body: [
        {
          type: "list",
          items: [
            "**Spread spectrum** deliberately widens a signal across a band, using a **chipping code** of +1/−1 chips.",
            "Chips run at a **much higher rate than data bits**, which is what does the spreading.",
            "The **Barker code** is the 11-chip sequence 802.11 uses for its DSSS preamble.",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "chipping and Barker",
          body: [
            {
              type: "p",
              text: "Two concepts from earlier modules carry the full weight of this paper, so they are worth restating before the mitigation technique is described. The first is spread spectrum, the transmission technique in which the bandwidth used by a signal is deliberately made much wider than the bandwidth the data itself needs. The second is the spreading code, a pseudorandom sequence that is multiplied into the data and carefully chosen so that the spread version has excellent autocorrelation properties.",
            },
            {
              type: "p",
              text: "The spreading code is a sequence of +1 and −1 'chips' — code bits, the elements of the spreading sequence, which are distinguished from data bits because they run at a much higher rate. Each data bit is replaced by the whole code word, so a code of length N chips transmits one data bit in N chips. The processing gain, the improvement in output signal-to-noise ratio the receiver gains by despreading, is essentially the code length when expressed as a ratio: a length-11 code buys roughly 10 dB of processing gain. Because the same code is used at both ends, an authorised receiver that knows the code can compress the wanted energy back into its original narrow band while any unwanted energy — including a microwave oven's — remains spread, which is the whole reason spread spectrum coexists so well with interference.",
            },
            {
              type: "formula",
              tex: "B_{spread} \\approx (N_{chips}) \\times R_{chip}",
              text: "The spread bandwidth is approximately the number of chips per second times the chip duration's reciprocal, i.e. the chip rate equals the spread bandwidth. For the paper's testbed, 11 chips per 363 kbps data rate gives a chip rate of about 4 Mcps, and the paper confirms the modulated signal's bandwidth is 8 MHz.",
            },
            {
              type: "p",
              text: "The specific code the paper's testbed uses is the Barker code. Barker codes are short binary sequences famous for having a single large autocorrelation peak and very low side lobes, which makes synchronisation easy and sidelobe-induced false peaks unlikely. The paper uses the 11 chip Barker spreading code, the well-known sequence +1 +1 +1 −1 −1 −1 +1 −1 −1 +1 −1, which is the code 802.11b used for its 1 Mbps and 2 Mbps DSSS modes. Its side-lobe levels are only ±1 out of a peak of 11, so it is unusually clean for a code that short.",
            },
            {
              type: "p",
              text: "This is why the paper can claim its results are generalisable. The abstract describes the technique as applied in the experimental case where Barker spread Wi-Fi signals carry data in the presence of MWO emissions, and the testbed section states that the results of this interference mitigation study are applicable to IEEE 802.11 Wi-Fi systems in general. Barker spreading is real 802.11 physical-layer technology, and interference avoidance is a technique that applies regardless of which spreading code is in use: the timing of when you transmit is orthogonal to how you modulate.",
            },
            {
              type: "note",
              text: "Do not conflate the two layers of defence. Spread spectrum raises the receiver's tolerance to noise, which helps against ordinary interference. Interference avoidance changes when the transmitter is allowed to fire at all, which is the only thing that works against an interferer so strong that no amount of processing gain suffices.",
            },
          ],
        },
      ],
    },
    {
      id: "s9",
      title: "The Paper's Mitigation Idea: a Cognitive Radio in the Loop",
      body: [
        {
          type: "list",
          items: [
            "The mitigation idea: put a **cognitive radio in the loop** that senses the oven and gates Wi-Fi around it.",
            "Sensing on raw energy alone **fails** — the Wi-Fi signal itself trips the detector.",
            "A true **cognitive radio** must **sense, learn and adapt** — not merely detect energy.",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "what makes it cognitive",
          body: [
            {
              type: "p",
              text: "The paper introduces its technique by contrasting it with CSMA. Since the MWO is oblivious to carrier-sense discipline, a mitigation approach was outlined in the authors' earlier work and is developed here: send data during the MWO's OFF cycles. The paper's Fig. 1 shows a qualitative plot of the concept with data packets placed in the gaps between MWO bursts. For that idea to work in practice two capabilities are required, and the paper names them: it is necessary to detect the presence of MWO interference signals, and to synchronise the data transmitter with the MWO's ON-OFF cycles.",
            },
            {
              type: "p",
              text: "Sensing alone is not enough, and the reason is the one identified in the last section: a burst detector that keys on raw energy will be triggered by the Wi-Fi signal itself. A cognitive radio that mistook its own network's traffic for an oven would spend its life hiding from its own packets. The paper's design therefore looks for the MWO specifically, not for energy in general. Its heartbeat is the AC line reference: it correlates candidate bursts against the 60 Hz sine and accepts a detection only when the timing agrees with where a rectifier transient would have to be. The technique is thus a correlation-based detector, and the paper is explicit that its transceiver is controlled to communicate only during the OFF cycles once the signature of a radiating MWO signal is detected.",
            },
            {
              type: "p",
              text: "The paper characterises the resulting system as an experimental cognitive radio. That terminology deserves care, because cognitive radio is often used loosely. The defining ideas of cognitive radio are that the equipment observes its radio environment, builds a representation of what is happening in the spectrum, and adapts its own transmission accordingly. The paper's system does exactly that on one axis — it senses, classifies an interferer by comparing the sensed waveform against a stored expectation, and reconfigures the transmitter's timing. What it does not do is negotiate, use a shared database or reason about other users' protocols. It is a narrowband, single-purpose cognitive loop, which is precisely what makes it cheap enough that the paper can call it practically realisable on consumer access points and other Wi-Fi devices.",
            },
            {
              type: "note",
              text: "The paper's own summary of the technique: the smart radio system ignores all Wi-Fi signals and only triggers when a MWO signal is present. Self-triggering on your own traffic is the failure mode the transient detector is designed to avoid.",
            },
          ],
        },
      ],
    },
    {
      id: "s10",
      title: "The Detection Chain, Step by Step",
      body: [
        {
          type: "list",
          items: [
            "The detection chain: **antenna → baseband converter → threshold detector → transient detector**.",
            "The **threshold detector** finds any energy above the noise floor; the **transient detector** compares that against the **AC line reference**.",
            "The **60 Hz line reference is the anchor of the whole scheme** — it is what separates oven from Wi-Fi, because only the oven is line-locked.",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "each block in the chain",
          body: [
            {
              type: "p",
              text: "The paper gives a moderately detailed block diagram of the experimental cognitive radio in its Fig. 2, and every block earns its place. The signal is picked up by an antenna and fed to a baseband converter; there is a threshold detector; there is a transient detector whose second input is a 60 Hz AC line reference; and there is a transmit controller, annotated '50 / 100 %', which drives the Wi-Fi transmitter. The chain is worth walking through in the paper's own order, because exam questions tend to ask which block does what.",
            },
            {
              type: "list",
              items: [
                "Antenna plus baseband converter: the 2.4 GHz ISM band signal received by the antenna is down-converted by the baseband converter into a form the logic can process. Down-conversion is the standard first step of any receiver — the wanted band is translated to a low centre frequency so it can be sampled and compared cheaply.",
                "Threshold detector: senses any received signal above the background noise threshold. Its output is labelled y(t) in the paper's diagram. This block answers the crude question 'is there energy here above the noise floor', without asking whose energy it is.",
                "Transient detector: compares the threshold detector output y(t) with the 60 Hz AC line reference signal. If the timing of y(t) matches the expected MWO transient time location, then the cognitive radio records the detection of a transient. The expected locations are 2 ms before or after the zero voltage crossings of the sinusoidal AC line reference.",
                "Decision logic: if the transient detector records the presence of several transient pulses over consecutive AC line cycles, the cognitive radio concludes that a MWO interference signal is present. Requiring several consecutive matches is a persistence test, and it is what stops one stray spike from hijacking the link.",
                "Transmit controller (50 / 100 %): if a MWO signal is present, it instructs the Wi-Fi transmitter to synchronise with the AC line cycle and operate only during the MWO OFF cycles — the 50% path. If the MWO signal is not detected, it instructs the transmitter to operate normally — the 100% path.",
              ],
            },
            {
              type: "p",
              text: "Two design details are easy to miss and both are the point of the architecture. First, the AC line reference is the anchor of the whole scheme. The MWO's periodicity is not a radio phenomenon at all; it is a mains-supply phenomenon, and any receiver that can see the mains waveform — which a mains-powered access point trivially can — holds the same clock the oven obeys. Synchronisation therefore needs no protocol, no handshake and no cooperation. Second, the decision is a persistence decision, not a single-sample decision. The paper requires several transient pulses over consecutive AC line cycles before declaring an MWO present, which is the classic way to convert a noisy detector into a reliable one at the cost of a small amount of latency.",
            },
            {
              type: "example",
              text: "A designer must size the persistence window. The paper's detector requires several transient pulses over consecutive AC line cycles, and transient windows occur at the AC zero crossings. If four consecutive line cycles are required before declaring an MWO present, how much time does the declaration take, and what is the latency penalty at 60 Hz versus 50 Hz?",
              steps: [
                "Each line cycle contains two zero crossings, so there are two transient opportunities per cycle in the model the paper uses.",
                "Requiring four consecutive line cycles means waiting 4 × 16.7 ms ≈ 67 ms at 60 Hz before the decision is firm.",
                "At 50 Hz the same four cycles take 4 × 20 ms = 80 ms, so the 50 Hz case declares marginally later.",
                "During this detection interval the transmitter is still on the 100% path and therefore exposed to the interference; the persistence window is the price paid for not being fooled by stray spikes.",
                "After the declaration the controller switches to the 50% path, and the line phase it already holds tells it when the OFF windows will be — no further sensing is needed to place individual packets.",
              ],
            },
          ],
        },
      ],
    },
    {
      id: "s11",
      title: "Sensing the Interference in the Presence of the Wi-Fi Signal",
      body: [
        {
          type: "list",
          items: [
            "Hardest problem: **detecting the oven while your own network is transmitting**.",
            "In the **time domain**: Wi-Fi arrives at random times (traffic + backoff), the oven is **periodic**.",
            "In the **frequency domain**: the oven spans up to **60 MHz** across the band, while Wi-Fi occupies a **narrow channel**.",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "separating the two signals",
          body: [
            {
              type: "p",
              text: "The hardest engineering problem in the paper is not detecting the oven but detecting it while your own network is transmitting. A spread-spectrum Wi-Fi signal looks, to a naive power detector, very much like interference: it is wideband, and its envelope has structure. The paper confronts this directly with the principle that the smart radio system ignores all Wi-Fi signals, and the mechanism by which it ignores them is the AC line reference comparison rather than a spectral template.",
            },
            {
              type: "p",
              text: "Consider what distinguishes the two signals in the time domain. Wi-Fi traffic arrives at random times, determined by the offered traffic and by the CSMA backoff process — there is no reason for it to align with the AC line. The MWO's transients arrive only within a narrow, line-synchronised window, 2 ms before or after each zero crossing. A correlator that asks 'did this candidate event occur at the time an MWO transient would have occurred' therefore rejects Wi-Fi hits almost for free: the probability that a random Wi-Fi burst happened to land exactly in the transient window is small, and the probability that several consecutive bursts all landed there is vanishingly small. This is the persistence test doing double duty — it suppresses noise-flicker false alarms and it suppresses self-interference at the same time.",
            },
            {
              type: "p",
              text: "There is also a spectral dimension to the discrimination. The MWO's energy is up to 60 MHz wide and spread across the whole ISM band, whereas the testbed Wi-Fi signal occupies 8 MHz. A receiver with enough analysis bandwidth sees energy in parts of the 2.4 GHz band where the local Wi-Fi network cannot have put any, so wideband occupancy is itself evidence of an unintentional radiator. Practically, a designer would combine both tests: broad occupancy across the band plus line-synchronised transient timing. Either test alone is fallible; together they are a robust signature.",
            },
            {
              type: "p",
              text: "Notice that the mitigation system's own transmitter becomes a source of confusion for its own detector, so the design has to tolerate that. The transmit controller is what resolves the conflict: it already knows when it has authorised a transmission, so it can discount activity during those periods, and it only needs the sensing decision to be correct in the aggregate — several consecutive line cycles — rather than per-sample. The whole chain is a good illustration of a general lesson in radio engineering: sensing reliability comes from exploiting structure in the interferer, not from brute-force energy detection.",
            },
            {
              type: "note",
              text: "A cleaner alternative that the paper does not use, but which is standard practice today: sense in a band the local network is not using, or blank the sensing during your own transmit bursts. Both are ways of removing self-interference from the detector's input rather than asking the detector to see through it.",
            },
          ],
        },
      ],
    },
    {
      id: "s12",
      title: "Synchronising to the Line Cycle and the 50/100 Percent Choice",
      body: [
        {
          type: "list",
          items: [
            "Once the oven is declared, the controller **gates Wi-Fi transmission into the OFF windows**.",
            "The gain is modest: if OFF windows are just over half a line period, the achievable duty cycle is about **50%**.",
            "The delicate part: the transmitter must **finish the packet it started**, not gate itself mid-frame.",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "the 50% duty trade",
          body: [
            {
              type: "p",
              text: "Once the presence of an MWO has been declared, the control problem is trivial in concept and delicate in execution. The transmit controller instructs the Wi-Fi transmitter to synchronise with the AC line cycle and operate only during the MWO OFF cycles. The paper labels this block 'Transmit Controller (50 / 100 %)', which is a compact statement of the trade the designer accepts: half the time is surrendered in exchange for reliability.",
            },
            {
              type: "p",
              text: "The arithmetic of that trade is simple. If packets are launched only in OFF windows and OFF windows are slightly more than half of each line period, then the achievable duty cycle is a little under 100% of half the time — in round numbers, half. The paper's measured data rate falls from 363.3 kbps to 181.7 kbps in the mitigated case, which is the experimental confirmation of the halving. Since the mechanism is 'somewhat less than half the line cycle is ON', a designer who knows the exact ON fraction for the specific oven model could in principle do better than a flat 50%, but the paper's controller uses the conservative 50% path.",
            },
            {
              type: "p",
              text: "The delicate part is that the transmitter must not simply be gated on and off at the line rate; it must also finish what it starts. A 128-bit packet transmitted at 363.3 kbps occupies about 352 microseconds of airtime, which is small compared with the roughly 8 ms OFF window, so packet-level placement is comfortable in the testbed. In a faster 802.11 system a long frame could exceed the remaining OFF time, and then the schedule would have to fragment or defer the frame, or shorten the frame through the MAC's fragmentation feature. The paper's system does not need to solve this problem because its packets are short, and it says so by specifying 128 bit packets.",
            },
            {
              type: "p",
              text: "There is also a guard-interval question, which the paper's transient analysis answers. The paper states that transients appear 2 ms before or after AC zero crossings. A transmitter that packed data right up to the theoretical edge of the OFF window would be running into exactly those transient-laden moments. A prudent design therefore treats the ±2 ms transient zones as part of the ON period and keeps data out of them — the whole ±2 ms description exists to define that guard band. The paper's qualitative Fig. 1 shows data packets comfortably inside the gaps, not touching their edges.",
            },
            {
              type: "formula",
              tex: "R_{mitigated} \\approx \\frac{T_{OFF}}{T_{line}} \\times R_{full} \\approx 0.5 \\times R_{full}",
              text: "The mitigated data rate is roughly the fraction of the line period available as usable OFF time, multiplied by the full data rate. The paper's measurements bear this out: 181.7 kbps is about half of 363.3 kbps.",
            },
            {
              type: "note",
              text: "Remember the control logic as a two-state switch: no MWO detected, 100% and normal operation; MWO detected, 50% and line-synchronised transmission during OFF cycles only. The paper labels the controller exactly that way.",
            },
          ],
        },
      
        {
          type: "viz",
          viz: "line-duty",
        },
      ],
    },
    {
      id: "s13",
      title: "The Experimental Testbed and Two Study Cases",
      body: [
        {
          type: "list",
          items: [
            "The testbed used a **ComBlock transmitter/receiver** and **128-bit packets**.",
            "BER was recorded with and without mitigation, across **three different microwave ovens** — a deliberate robustness check.",
            "Two scenarios were tested for each oven, giving two tables of results.",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "the testbed setup",
          body: [
            {
              type: "p",
              text: "The paper's Section III describes the testbed. Data is transmitted and received in the presence of MWO interference using a ComBlock transmitter — the manufacturer is Mobile Satellite Services, comblock.com — operating at 363 kbps with the 11 chip Barker spreading code. The paper states that the modulated signal's bandwidth is 8 MHz, and it adds the important generalisation that the results of this interference mitigation study are applicable to IEEE 802.11 Wi-Fi systems in general.",
            },
            {
              type: "p",
              text: "The data is transmitted in 128 bit packets by the ComBlock, and the ComBlock receiver captures and decodes those packets, which are used to obtain the experimental bit error rate. The paper stresses one geometric control: in all experiments the receiver was placed in a position equidistant from the Wi-Fi transmitter and the interfering MWO. That choice matters because BER depends steeply on the ratio of wanted to unwanted signal power at the receiver, and equidistance removes the trivial situation in which the oven happens to be far away.",
            },
            {
              type: "p",
              text: "Three different MWOs were used in the BER study, and two experimental scenarios were tested for each MWO, with the BER recorded each time. Using three ovens is a deliberate acknowledgement of the point made in the spectral-signature section: different models leak differently, have different cavity shapes, different door seals and different supplies, so an interference study based on a single appliance would not generalise. Case 1 is the control: the Wi-Fi transmitter operates at 2.46 GHz without any interference mitigation, and the paper notes that in this frequency range the AM-FM signal of the MWO exists and there is high interference. Case 2 is the mitigated experiment in which the interference mitigation system is active.",
            },
            {
              type: "table",
              head: ["Testbed element", "Specification", "Source"],
              rows: [
                ["Transmitter", "ComBlock", "the paper"],
                ["Data rate, Case 1", "363.3 kbps", "the paper's Table 1"],
                ["Data rate, Case 2", "181.7 kbps", "the paper's Table 2"],
                ["Spreading code", "11 chip Barker code", "the paper"],
                ["Modulated signal bandwidth", "8 MHz", "the paper"],
                ["Packet size", "128 bits", "the paper"],
                ["Channel tested", "2.46 GHz, inside the MWO AM-FM region", "the paper"],
                ["Ovens tested", "three different MWOs", "the paper"],
                ["Receiver placement", "equidistant from Wi-Fi transmitter and MWO", "the paper"],
              ],
            },
            {
              type: "note",
              text: "The 8 MHz bandwidth and the 363 kbps rate are consistent with a direct-sequence spread-spectrum signal: spreading 128-bit packets with an 11-chip Barker code at a chip rate of about 4 Mcps yields roughly 352 microseconds of airtime per packet, small enough to fit inside a single OFF window.",
            },
          ],
        },
      ],
    },
    {
      id: "s14",
      title: "Bit Error Rate as the Performance Metric",
      body: [
        {
          type: "list",
          items: [
            "**BER** = bits received in error ÷ total bits transmitted. It is a **probability**, not a count.",
            "**BER 0.01** means one bit in every hundred is wrong.",
            "BER is the paper's performance metric because it is measurable directly from the testbed.",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "reading BER numbers",
          body: [
            {
              type: "p",
              text: "The paper's abstract names its performance metric plainly: bit error rate is evaluated to provide a performance metric for the mitigation technique. The testbed description confirms how it was obtained — the receiver decodes the transmitted 128-bit packets and the decoded bits are compared against the transmitted bits to yield the experimental BER. BER is the right choice for this study, and it is worth articulating why, because it is the bridge between the physical-layer event (a corrupted waveform) and the user-level outcome (a dropped connection).",
            },
            {
              type: "p",
              text: "BER is defined as the ratio of bits received in error to the total number of bits transmitted. It is a dimensionless probability: a BER of 0.01 means that one bit in every hundred arrives wrong on average. Because it is measured by counting decoded bits against the transmitted bit pattern, it can be evaluated directly in the laboratory without any model of the interference — which is what makes it the natural performance metric for the paper's experiment.",
            },
            {
              type: "formula",
              tex: "\\text{BER} = \\frac{\\text{number of bits in error}}{\\text{total number of bits transmitted}}",
              text: "Bit error rate is the fraction of transmitted bits that arrive corrupted. For the paper's testbed, the receiver decodes 128-bit packets and counts how many of those bits fail to match, then divides by the total number of bits sent across all packets in the run.",
            },
            {
              type: "p",
              text: "BER sits behind every other performance number a network reports. The frame error rate is roughly one minus the probability that all bits in the frame arrive correctly, so for an uncorrelated bit error process a 128-bit packet with BER p survives with probability (1 − p)^128. At the paper's worst measured unmitigated BER of 0.1129, (1 − 0.1129)^128 is astronomically small, meaning essentially no packets would survive — which is exactly why the paper says the ComBlock data packets are corrupted in Case 1. At the best unmitigated BER of 0.007315, a 128-bit packet survives with probability (1 − 0.007315)^128 ≈ 0.39, so about 61% of packets are lost even in the least-hostile unmitigated case. Against the mitigated BER of 0.000000, every packet decodes correctly.",
            },
            {
              type: "p",
              text: "A reliability caveat is standard practice and worth stating in an exam answer: a measured BER of exactly zero means no errors were observed in the test duration, not that errors are impossible. The honest statement is an upper bound — the true BER is somewhere below roughly one divided by the total number of bits observed. With the paper's reported zero BER over its recorded runs the practical conclusion stands: the link was reliable for the duration of the test, and the paper's wording is that packets are reliably transmitted.",
            },
            {
              type: "example",
              text: "Estimate packet survival at the paper's measured BERs, using 128-bit packets and assuming bit errors are independent. Then compare the surviving throughput with the unmitigated data rate.",
              steps: [
                "Case 1, MWO #2, BER = 0.1129: survival probability = (1 − 0.1129)^128. Since 0.8871^128 is astronomically small, effectively zero packets get through intact — the unmitigated link at this BER is unusable despite running at 363.3 kbps.",
                "Case 1, MWO #3, BER = 0.007315: survival = (1 − 0.007315)^128 ≈ 0.39, so roughly 39% of packets are intact and about 61% are corrupted.",
                "Case 1, MWO #1, BER = 0.016610: survival = (1 − 0.016610)^128 ≈ 0.12, so only about one packet in eight survives.",
                "Case 2, all three MWOs, BER = 0.000000: essentially all 128-bit packets decode, so the surviving throughput is the 181.7 kbps the paper reports.",
                "Conclusion: the useful throughput of the unmitigated case, after accounting for the packets destroyed by bit errors, is far below 363.3 kbps — which is precisely the paper's argument that the actual throughput of the experimental Wi-Fi system is much less than the mitigated case even though the data transmission rate is higher.",
              ],
            },
            {
              type: "note",
              text: "Exam tip: distinguish rate from throughput. The paper's whole conclusion turns on that distinction. A 363.3 kbps link that destroys most of its packets delivers less goodput than a 181.7 kbps link that delivers all of them.",
            },
          ],
        },
      ],
    },
    {
      id: "s15",
      title: "The Paper's Reported Results",
      body: [
        {
          type: "list",
          items: [
            "Two tables: **Case 1 (no mitigation)** and **Case 2 (with mitigation)**.",
            "Result: mitigation **substantially lowers BER** at the tested data rates.",
            "The paper reports its numbers exactly — read the tables for the figures.",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "the reported results",
          body: [
            {
              type: "p",
              text: "The paper's Section IV and its two tables present the experimental BERs for the two scenarios, one set per MWO. The reported numbers are reproduced here exactly as the paper gives them, with attribution, since fabricated or misremembered figures would be worse than useless in an exam answer.",
            },
            {
              type: "h3",
              text: "Table 1 — Case 1, no interference mitigation (paper's results)",
            },
            {
              type: "table",
              head: ["MWO #", "Data Rate (kbps)", "BER"],
              rows: [
                ["1", "363.3", "0.016610"],
                ["2", "363.3", "0.112900"],
                ["3", "363.3", "0.007315"],
              ],
            },
            {
              type: "h3",
              text: "Table 2 — Case 2, interference mitigated (paper's results)",
            },
            {
              type: "table",
              head: ["MWO #", "Data Rate (kbps)", "BER"],
              rows: [
                ["1", "181.7", "0.000000"],
                ["2", "181.7", "0.000000"],
                ["3", "181.7", "0.000000"],
              ],
            },
            {
              type: "p",
              text: "Four observations the paper draws from those two tables are worth memorising as the paper's own readings of its data. First, the results vary depending on the MWO used — the spread from 0.007315 to 0.112900 is a factor of about fifteen, which is why three ovens were tested rather than one. Second, for cases in which the distances between the MWO and the ComBlock receiver are lower, BER is expected to be elevated; distance is a primary control on the wanted-to-unwanted power ratio at the receiver. Third, the BER is high for the control case in Table 1, but Table 2 shows the measured zero BER obtained in the interference mitigated case. Fourth, and this is the paper's key argument, although the data rate drops to 50% in the interference mitigated case, data packets are reliably transmitted by the ComBlock system even when a MWO is operating.",
            },
            {
              type: "p",
              text: "The paper then states the counterfactual clearly: in the case where this interference mitigation is not used, the data rate remains at 100% but the BER is much higher and the ComBlock data packets are corrupted. So the actual throughput of the experimental Wi-Fi system is much less than the mitigated case even though the data transmission rate is higher. It ties this back to protocol behaviour — in IEEE Wi-Fi 802.11 systems, high packet drop rates due to interference leads to Wi-Fi connection loss — and concludes that the technique can be applied to minimise packet drop rates due to MWO interference.",
            },
            {
              type: "p",
              text: "Two methodological cautions are stated by the paper itself and should be repeated whenever these numbers are quoted. Because performance varies considerably if the distances between the receiver, transmitter and the MWO are changed, Tables 1 and 2 are meant only for comparative purposes; they demonstrate the performance of the experimental Wi-Fi system with or without interference mitigation, and they are not absolute records. Table 1 nevertheless shows that MWO interference significantly degrades the wireless communication system performance, making interference mitigation valuable, and the paper closes the section by noting that this method is practically realisable on consumer access points and other Wi-Fi devices.",
            },
            {
              type: "example",
              text: "Compare the three unmitigated BERs and the single mitigated BER, and state the size of the improvement in a form an exam answer could quote.",
              steps: [
                "MWO #1: BER falls from 0.016610 to 0.000000 — about 16,610 errors per million bits reduced to none observed.",
                "MWO #2: BER falls from 0.112900 to 0.000000 — this was the worst oven, roughly 112,900 errors per million bits.",
                "MWO #3: BER falls from 0.007315 to 0.000000 — about 7,315 errors per million bits.",
                "The mean unmitigated BER across the three ovens is (0.016610 + 0.112900 + 0.007315)/3 = 0.045608, roughly 0.0456, or about 45,608 errors per million bits.",
                "The price paid is the data rate: 363.3 kbps down to 181.7 kbps, essentially a halving, which corresponds to the half-cycle OFF duty factor the mitigation scheme relies on.",
              ],
            },
            {
              type: "note",
              text: "Quote these numbers as the paper's measurements, not as universal constants. They are comparative results from three specific ovens at specific distances with a specific equidistant receiver placement, and the paper says so explicitly.",
            },
          ],
        },
      ],
    },
    {
      id: "s16",
      title: "The Paper's Conclusions and Its Wider Lessons",
      body: [
        {
          type: "list",
          items: [
            "Conclusion: a cognitive-radio technique **successfully mitigated** MWO interference on Wi-Fi.",
            "Shared spectrum means **you cannot assume other users cooperate** — some are oblivious by design.",
            "The broader trade: **a link advertising a high rate it cannot deliver is worse than a slower honest one.**",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "the wider lessons",
          body: [
            {
              type: "p",
              text: "The paper's Section V states its conclusion directly: a cognitive radio experimental technique was implemented that successfully mitigated interference on Wi-Fi communications caused by MWO signals. This system provides reliable data transmission when a MWO is operating in proximity to a Wi-Fi system. The abstract frames the same result in terms of the cognitive radio paradigms that allow Wi-Fi devices to reliably transmit information while a residential MWO is operating. Those two sentences are the whole claim, and they are backed by the two tables of measured BERs.",
            },
            {
              type: "p",
              text: "Several wider lessons fall out of the work, and they are what make it worth reading as a course item rather than only as an appliance anecdote. The first is that shared spectrum is a matter of cooperation, and anything that cannot cooperate must be designed around rather than reasoned with. The second is that structure is exploitable. The MWO is only tractable because its interference has structure — a duty cycle tied to the mains, transients at known phase, a sweep caused by a known physical mechanism — and a cognitive radio is useful to the exact extent that it can identify and exploit such structure. The third is that avoiding interference in time is a different tool from surviving it in code: spread spectrum and forward error correction reduce the damage a fixed amount of interference does, whereas scheduling removes the interference altogether at a known cost in rate.",
            },
            {
              type: "p",
              text: "The fourth lesson is a rate-versus-reliability trade, and the paper is unusually clear about it. A link advertising a high data rate that cannot deliver its frames is worse than a link advertising half the rate that delivers everything. This is the same idea as the goodput-versus-bandwidth distinction from the performance module, and it is the reason the paper's headline numbers pair a halving of the data rate with a collapse of the BER to zero. Modern equivalents abound: rate adaptation in 802.11 falls back to lower MCS when frames fail, 5 GHz and 6 GHz bands were opened up largely to escape congestion in 2.4 GHz, and Bluetooth's adaptive frequency hopping exists to skip occupied channels — all of them are the same instinct the paper applies to the microwave oven.",
            },
            {
              type: "p",
              text: "A fifth lesson is closer to the system engineer's desk: the mitigation is cheap because it reuses information the device already has. The 60 Hz line reference is available for free at any mains-powered access point, so no extra radio, no handshake and no spectrum licence are required to establish synchronisation with the interferer. Cognitive radio is often presented as a complicated, expensive concept; this paper's contribution is to show a narrow, well-chosen application of it that costs almost nothing beyond a threshold detector, a correlator and a transmit gate — which is why the paper can credibly claim practical realisability on consumer access points.",
            },
            {
              type: "p",
              text: "Finally, the work is a good model of the research method itself, which matters when you are asked to critique it. It identifies a real problem with real measured data, it attributes its prior claims to its own earlier work and to standard references, it uses a controlled experimental design with three interferers and an equidistant receiver placement, it states its metric and its caveats plainly, and it declines to over-claim: the tables are explicitly labelled comparative rather than absolute, and the mitigation's cost is stated in the same sentence as its benefit. Reading a paper this way — claim, evidence, metric, caveats, cost — is itself examinable, and this module's flashcards reflect that structure.",
            },
          ],
        },
      ],
    },
  ],
  flashcards: [
    { q: "Who wrote the required paper for this module, and where was it published?",
      a: "Tanim M. Taher, Matthew J. Misurac, Joseph L. LoCicero and Donald R. Ucci of the Department of Electrical and Computer Engineering, Illinois Institute of Technology, Chicago. 'Microwave Oven Signal Interference Mitigation for Wi-Fi Communication Systems', IEEE CCNC 2008 proceedings.", sec: "s1" },
    { q: "What does the paper call the microwave oven, and why does that label matter?",
      a: "An unintentional interferer for 2.4 GHz IEEE 802.11 Wi-Fi signals. It matters because an unintentional radiator has no receiver, no MAC layer and no reason to cooperate, so you cannot negotiate with it — you must design around it.", sec: "s1" },
    { q: "What is the ISM band and where did its allocation come from?",
      a: "Industrial, Scientific and Medical — an unlicensed band. The 2.4 GHz ISM band was allocated at the 1947 ITU Atlantic City conference for industrial, scientific and medical equipment; the bargain is that such equipment may radiate freely provided it accepts interference and causes no harmful interference to licensed services.", sec: "s2" },
    { q: "Which devices does the paper list as operating in the 2.4 GHz band?",
      a: "IEEE 802.11 Wi-Fi access points, wireless laptops, Bluetooth devices and cordless phones — and, as an unintentional interferer, the residential microwave oven. The paper notes the unlicensed ISM bands are very attractive for consumer applications.", sec: "s2" },
    { q: "Why does microwave heating use roughly 2.45 GHz?",
      a: "It is dielectric heating of water molecules, which are electric dipoles; a fast-reversing field makes them rotate and collide, producing heat. Roughly 2.45 GHz is industrially chosen partly because it falls in an ISM band, so the appliance needs no special radio licence.", sec: "s4" },
    { q: "What is a magnetron and how does it generate microwaves?",
      a: "A vacuum tube oscillator: a central cathode and a ring of resonant anode cavities, with an axial magnetic field from permanent magnets. Electrons driven outward are curved into rotating spokes that give energy to the cavity fields, producing continuous oscillation around 2.45 GHz.", sec: "s4" },
    { q: "State the paper's description of the MWO signal.",
      a: "A wideband signal, up to 60 MHz wide, periodic, and synchronised to the 60 Hz AC line cycle. Its main characteristics are the ON-OFF duty cycle, transients and frequency sweep, and the paper notes the ON cycle is less than half of the 0.017 s 60 Hz period.", sec: "s5" },
    { q: "Why is the MWO emission bursty and periodic?",
      a: "The magnetron's anode supply is produced by a half-wave rectifier. The tube oscillates only while its anode voltage exceeds the oscillation threshold, so it conducts for less than half of each mains cycle. The result is one burst per half-cycle: an amplitude envelope repeating at 2 × the line frequency (120 Hz on a 60 Hz line).", sec: "s5" },
    { q: "At what times does the paper expect MWO transients?",
      a: "2 ms before or after the zero voltage crossings of the sinusoidal AC line reference. The threshold detector's output y(t) is compared against that 60 Hz reference, and a match means the cognitive radio records a transient detection.", sec: "s5" },
    { q: "What causes the MWO's frequency sweep, and why does it matter to Wi-Fi?",
      a: "The magnetron is a free-running oscillator whose frequency is pulled by the load impedance of the cooking cavity, which changes with the food and its heating. The sweep, plus the 50/60 Hz amplitude modulation, spreads the interference as the paper's AM-FM signal, so a 2.46 GHz Wi-Fi channel sees high interference even away from the nominal centre frequency.", sec: "s6" },
    { q: "Why does CSMA fail against a microwave oven?",
      a: "CSMA with collision avoidance is a mutual agreement — every Wi-Fi node senses the medium, defers when busy and backs off randomly. The paper notes the MWO is oblivious to this type of interference avoidance: it has no carrier sense, no backoff and no MAC, so it radiates regardless of whether a Wi-Fi frame is in progress.", sec: "s7" },
    { q: "What does the paper say follows from high packet drop rates in 802.11?",
      a: "Wi-Fi connection loss — the paper cites reference [6] on this. High packet drop rates due to interference lead to connection loss, and the paper's mitigation can be applied to minimise packet drop rates due to MWO interference.", sec: "s7" },
    { q: "What spreading code and what rate does the paper's ComBlock testbed use?",
      a: "The ComBlock transmitter operates at 363 kbps with the 11 chip Barker spreading code, and the paper states the modulated signal's bandwidth is 8 MHz. Data is sent in 128 bit packets, which the ComBlock receiver captures and decodes to obtain the experimental BER.", sec: "s8" },
    { q: "Why is the Barker code good for synchronisation?",
      a: "Barker codes have a single large autocorrelation peak with very low side lobes — for the length-11 code the side lobes are only ±1 against a peak of 11, keeping false peaks and sidelobe-induced misalignment very unlikely.", sec: "s8" },
    { q: "Name the blocks in the paper's cognitive radio and their jobs.",
      a: "Baseband converter down-converts the received 2.4 GHz ISM signal; threshold detector senses any signal above the background noise threshold giving y(t); transient detector compares y(t) with the 60 Hz AC line reference; the decision logic declares an MWO after several transients over consecutive line cycles; the transmit controller (50 / 100 %) gates the Wi-Fi transmitter.", sec: "s10" },
    { q: "How does the cognitive radio avoid triggering on its own Wi-Fi traffic?",
      a: "It does not detect energy in general; it correlates candidate events with the 60 Hz AC line reference and only accepts transients at the expected 2 ms-before-or-after-zero-crossing times. Requiring several consecutive line cycles of matches makes a chance Wi-Fi alignment negligible. The paper says it ignores all Wi-Fi signals and only triggers when a MWO signal is present.", sec: "s11" },
    { q: "What does the transmit controller's '(50 / 100 %)' label mean?",
      a: "Two states: if no MWO is detected the transmitter operates normally at 100%; if an MWO is detected the transmitter synchronises with the AC line cycle and operates only during the MWO OFF cycles, i.e. roughly 50% of the time.", sec: "s12" },
    { q: "How much data rate does the mitigation cost, and what does it buy?",
      a: "The paper's tables show 363.3 kbps unmitigated dropping to 181.7 kbps mitigated — a halving. What it buys is the BER falling to 0.000000 for all three ovens, i.e. data packets are reliably transmitted even while the MWO operates.", sec: "s12" },
    { q: "What were the three experimental controls in the paper's testbed?",
      a: "Three different MWOs were used; two scenarios (no mitigation and mitigated) were run for each; and the receiver was placed equidistant from the Wi-Fi transmitter and the interfering MWO. The Wi-Fi channel tested was 2.46 GHz, inside the MWO's AM-FM region.", sec: "s13" },
    { q: "Give the paper's Case 1 (no mitigation) BERs.",
      a: "MWO #1: 0.016610 at 363.3 kbps. MWO #2: 0.112900 at 363.3 kbps. MWO #3: 0.007315 at 363.3 kbps. The results vary depending on the MWO used.", sec: "s15" },
    { q: "Give the paper's Case 2 (mitigated) BERs and rate.",
      a: "All three MWOs gave BER 0.000000 at a data rate of 181.7 kbps — the measured zero BER obtained in the interference mitigated case.", sec: "s15" },
    { q: "Why does the paper say the unmitigated system's actual throughput is lower despite its higher data rate?",
      a: "In the unmitigated case the data rate stays at 100% but the BER is much higher and the ComBlock data packets are corrupted. So the actual throughput of the experimental Wi-Fi system is much less than the mitigated case even though the data transmission rate is higher.", sec: "s15" },
    { q: "What caveat does the paper attach to its BER tables?",
      a: "Because performance varies considerably if the distances between receiver, transmitter and MWO change, Tables 1 and 2 are meant only for comparative purposes. They demonstrate performance with or without mitigation and are not absolute records. It also notes lower MWO-to-receiver distances will elevate BER.", sec: "s15" },
    { q: "State the paper's conclusion in one sentence.",
      a: "A cognitive radio experimental technique was implemented that successfully mitigated interference on Wi-Fi communications caused by MWO signals, and this system provides reliable data transmission when a MWO is operating in proximity to a Wi-Fi system.", sec: "s16" },
    { q: "What does the paper say about the practicality of the technique?",
      a: "The method is practically realisable on consumer access points and other Wi-Fi devices. The technique is described as applicable to IEEE 802.11 Wi-Fi systems in general, not only to the ComBlock testbed.", sec: "s16" },
    { q: "What is a measured BER of exactly zero really telling you?",
      a: "That no bit errors were observed during the test — an upper bound rather than proof that errors are impossible. The honest statement is that the true BER is below roughly one divided by the total bits observed in the run.", sec: "s14" },
  ],
  quiz: [
    { q: "According to the paper, what kind of interferer is a residential microwave oven?",
      choices: ["An intentional radiator that shares the band under a licence", "An unintentional interferer for 2.4 GHz IEEE 802.11 Wi-Fi signals", "A licensed primary user of the 2.4 GHz ISM band", "A narrowband interferer confined to a single 20 MHz Wi-Fi channel"],
      answer: 1,
      why: "The paper's abstract calls the MWO a popular appliance that acts as an unintentional interferer for 2.4 GHz IEEE 802.11 Wi-Fi communication signals. It also describes its emission as wideband, up to 60 MHz, not narrowband.", sec: "s1" },
    { q: "Which group of devices does the paper name as sharing the 2.4 GHz band?",
      choices: ["Broadcast television, FM radio and amateur radio", "Wi-Fi access points, wireless laptops, Bluetooth devices and cordless phones", "Only IEEE 802.11 access points and their associated clients", "Satellite uplinks, radar and licensed microwave backhaul"],
      answer: 1,
      why: "The paper's introduction lists IEEE 802.11 Wi-Fi access points, wireless laptops, Bluetooth devices and cordless phones as operating in the 2.4 GHz band — an unlicensed ISM band that is very attractive for consumer applications.", sec: "s2" },
    { q: "Why is the MWO's interference bursty and periodic rather than continuous?",
      choices: ["Because the turntable periodically blocks the waveguide", "Because the door seal opens and closes during cooking", "Because a half-wave rectified anode supply lets the magnetron conduct for less than half of each mains cycle", "Because the magnetron is switched off every time the control panel timer updates"],
      answer: 2,
      why: "The half-wave supply lets the tube oscillate only while its anode voltage exceeds the oscillation threshold, so it conducts for under half a mains cycle. The envelope therefore repeats at twice the line frequency — the reason the paper synchronises the mitigation to the 60 Hz AC line.", sec: "s5" },
    { q: "The paper reports that the MWO's ON cycle is less than half of which period?",
      choices: ["0.017 s, the 60 Hz AC line period", "0.0001 s, one Wi-Fi chip duration", "1 s, the access point beacon interval", "0.017 ms, the MWO's switching interval"],
      answer: 0,
      why: "The paper states that the ON cycle is less than half of the 0.017 s 60 Hz period. That is 1/60 s ≈ 0.0167 s, the period of the 60 Hz AC line to which the MWO emission is synchronised.", sec: "s5" },
    { q: "Where does the paper expect MWO transients to occur in time?",
      choices: ["Randomly, with no relation to any system clock", "Exactly at the peak of each AC line half-cycle", "2 ms before or after the zero voltage crossings of the AC line reference", "At multiples of the 8 MHz Wi-Fi symbol rate"],
      answer: 2,
      why: "The transient detector compares y(t) with the AC line reference, and the paper states the expected transient time locations are 2 ms before or after the zero voltage crossings of the sinusoidal AC line reference.", sec: "s5" },
    { q: "What does the paper say is necessary for successful interference mitigation?",
      choices: ["Raising the Wi-Fi transmit power above the MWO's leakage", "Detecting the presence of MWO interference signals and synchronising the data transmitter with the MWO's ON-OFF cycles", "Adding a narrowband notch filter at 2.45 GHz in the receiver front end", "Moving the access point into a metal enclosure"],
      answer: 1,
      why: "The paper states that for successful interference mitigation it is necessary to detect the presence of MWO interference signals and synchronise the data transmitter with the MWO's ON-OFF cycles. That is exactly what the experimental cognitive radio does.", sec: "s9" },
    { q: "Why does the paper say CSMA cannot solve MWO interference?",
      choices: ["Because CSMA is too slow for a 2.4 GHz channel", "Because the MWO is oblivious to this type of interference avoidance", "Because CSMA requires a licence in the ISM band", "Because CSMA only works in 5 GHz bands"],
      answer: 1,
      why: "The paper acknowledges CSMA is effective in Wi-Fi collision avoidance but points out the MWO is oblivious to this type of interference avoidance — it has no carrier sense, no backoff and no MAC layer, so it cannot be negotiated with.", sec: "s7" },
    { q: "What does the cognitive radio do once it concludes a MWO interference signal is present?",
      choices: ["It raises its transmit power and repeats each packet three times", "It instructs the Wi-Fi transmitter to synchronise with the AC line cycle and operate only during the MWO OFF cycles", "It switches off the Wi-Fi radio entirely until the MWO stops", "It retunes the access point to 2.46 GHz to avoid the oven"],
      answer: 1,
      why: "The transmit controller instructs the Wi-Fi transmitter to synchronise with the AC line cycle and operate only during the MWO OFF cycles. If no MWO is detected it instructs the transmitter to operate normally.", sec: "s10" },
    { q: "What did the experimental ComBlock transmitter use for spreading?",
      choices: ["A 64 chip Walsh-Hadamard code", "The 11 chip Barker spreading code at 363 kbps", "Frequency hopping over 79 channels", "No spreading at all, using a simple BPSK carrier"],
      answer: 1,
      why: "The paper's testbed section states the ComBlock transmitter operated at 363 kbps with the 11 chip Barker spreading code, and that the modulated signal's bandwidth is 8 MHz.", sec: "s13" },
    { q: "What was the bandwidth of the testbed's modulated Wi-Fi signal?",
      choices: ["1 MHz", "8 MHz", "22 MHz", "60 MHz"],
      answer: 1,
      why: "The paper states the modulated signal's bandwidth is 8 MHz. The 60 MHz figure in the paper refers to the width of the MWO's interference, not to the Wi-Fi signal.", sec: "s13" },
    { q: "How did the paper obtain its experimental bit error rate?",
      choices: ["By simulating the MWO in software with no physical hardware", "By decoding the transmitted 128 bit ComBlock packets at the receiver and comparing them with what was sent", "By measuring the received signal power with a spectrum analyser", "By reading the error counters of a commercial 802.11 access point"],
      answer: 1,
      why: "The paper says the data is transmitted in 128 bit packets by the ComBlock, and the ComBlock receiver captures and decodes those packets, which are used to obtain the experimental BER.", sec: "s13" },
    { q: "What is the paper's reported BER for MWO #2 in the unmitigated case?",
      choices: ["0.000000", "0.007315", "0.016610", "0.112900"],
      answer: 3,
      why: "Table 1 of the paper records BER 0.112900 at 363.3 kbps for MWO #2 — the worst of the three ovens. 0.016610 is MWO #1 and 0.007315 is MWO #3.", sec: "s15" },
    { q: "What BER did the paper measure for all three MWOs once mitigation was active, and at what data rate?",
      choices: ["BER 0.000000 at 181.7 kbps", "BER 0.000000 at 363.3 kbps", "BER 0.001000 at 181.7 kbps", "BER 0.007315 at 363.3 kbps"],
      answer: 0,
      why: "The paper's Table 2 shows the measured zero BER for all three ovens in the interference mitigated case, and the data rate is 181.7 kbps — a drop to 50% of the 363.3 kbps unmitigated rate.", sec: "s15" },
    { q: "What is the paper's argument about data rate versus throughput?",
      choices: ["Higher data rate always means higher throughput, so no mitigation should be used", "The unmitigated case keeps 100% data rate but corrupts packets, so its actual throughput is much less than the mitigated case", "Data rate and throughput are identical in 802.11 systems", "The mitigated case has both a higher data rate and a higher throughput"],
      answer: 1,
      why: "The paper states that without mitigation the data rate remains at 100% but the BER is much higher and the ComBlock data packets are corrupted, so the actual throughput is much less than the mitigated case even though the data transmission rate is higher.", sec: "s15" },
    { q: "What caveat does the paper attach to its two BER tables?",
      choices: ["They were obtained entirely by simulation rather than measurement", "Because performance varies considerably with the distances involved, the tables are meant only for comparative purposes", "They apply only to ComBlock hardware and never to IEEE 802.11", "The BER values are estimates, since no error counting was performed"],
      answer: 1,
      why: "The paper notes that performance varies considerably if the distances between the receiver, transmitter and MWO are changed, so Tables 1 and 2 are meant only for comparative purposes — they demonstrate performance with or without mitigation rather than absolute values.", sec: "s15" },
    { q: "What is the paper's overall conclusion?",
      choices: ["MWO interference cannot be mitigated in the 2.4 GHz band", "A cognitive radio experimental technique successfully mitigated MWO interference on Wi-Fi, providing reliable data transmission when an MWO operates in proximity", "802.11 should abandon the 2.4 GHz band entirely", "Increasing Wi-Fi transmit power is the most effective mitigation"],
      answer: 1,
      why: "The paper's conclusion section states a cognitive radio experimental technique was implemented that successfully mitigated interference on Wi-Fi communications caused by MWO signals, providing reliable data transmission when a MWO operates near a Wi-Fi system.", sec: "s16" },
  ],
});
