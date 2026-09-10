window["NSCOM" + "_MODULES"] = window["NSCOM" + "_MODULES"] || [];
window.NSCOM_MODULES.push({
  id: "m08",
  num: 8,
  title: "Data Link Protocols — LAN",
  accent: "#9ab8ff",
  icon: `<svg viewBox="0 0 32 32" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="16" cy="16" r="3"/><circle cx="4" cy="6" r="2.4"/><circle cx="28" cy="6" r="2.4"/><circle cx="4" cy="26" r="2.4"/><circle cx="28" cy="26" r="2.4"/><path d="M6 7.5l7 6.4M26 7.5l-7 6.4M6 24.5l7-6.4M26 24.5l-7-6.4"/></svg>`,
  summary:
    "Local-area networks need a shared set of rules before equipment from different manufacturers can interoperate, and that is what the IEEE 802 project was created to provide. This module covers the 802 project and its split into Logical Link Control and Media Access Control, the Ethernet standard from Metcalfe and Boggs onward, Ethernet's connectionless and unreliable service, the full IEEE 802.3 frame format (preamble, start-of-frame delimiter, destination and source MAC addresses, length/type, data and CRC), why the minimum and maximum frame lengths exist, the 48-bit address format with its unicast/multicast/broadcast bit, the CSMA/CD access method with 1-persistent behaviour, the standard Ethernet implementations (10Base5, 10Base2, 10BaseT, 10BaseF), switched Ethernet and the collapse of the collision domain, Fast Ethernet at 100 Mbps with auto-negotiation, Gigabit Ethernet with its full-duplex and half-duplex modes, frame bursting and the 512-byte minimum frame, 10 Gigabit Ethernet, and the roles of the MAC address, ARP and the transparent-bridging forwarding table — each supported by worked arithmetic.",
  sections: [
    {
      id: "s1",
      title: "Why LANs Needed a Standard: The IEEE 802 Project",
      body: [
        {
          type: "fig",
          fig: "m08-p02-ieee-802-project",
          caption: "Slide: the IEEE 802 Project — the umbrella effort under which LAN standards are written.",
        },
        {
          type: "p",
          text: "Project 802 started in 1985 with a single engineering goal: to set standards that would enable intercommunication among equipment from a variety of manufacturers. Before it existed, each vendor implemented its own framing, its own addressing and its own access rules, so two computers could only talk if they happened to come from the same company. The project was started by the IEEE Computer Society, and it deliberately did not seek to replace any part of the OSI model or the TCP/IP protocol suite.",
        },
        {
          type: "fig",
          fig: "m08-p03-ieee-802-project",
          caption: "Slide: the scope of Project 802 — the physical layer and data-link layer of the major LAN protocols, split into LLC and MAC sublayers.",
        },
        {
          type: "list",
          items: [
            "Project 802 started in 1985 to set standards enabling intercommunication among equipment from a variety of manufacturers.",
            "It was started by the IEEE Computer Society.",
            "Project 802 does not seek to replace any part of the OSI model or the TCP/IP protocol suite.",
            "The goal was to specify the functions of the physical layer and the data-link layer of major LAN protocols.",
            "Its work is split into two sublayers: Logical Link Control and Media Access Control.",
          ],
        },
        {
          type: "h3",
          text: "Logical Link Control (LLC) and Media Access Control (MAC)",
        },
        {
          type: "p",
          text: "The 802 project divided the OSI data-link layer into two sublayers so that the parts common to every LAN could be written once while the parts that depend on the medium could vary. Logical Link Control is the part of 802 that defines flow control, error control and framing, and it provides a single link-layer control protocol for all IEEE LANs — the same LLC is used above Ethernet, Token Ring and wireless LANs alike. Media Access Control is the sublayer that defines the specific access method for each LAN, which is why CSMA/CD, token passing and CSMA/CA each live in their own standard.",
        },
        {
          type: "table",
          head: ["Sublayer", "Defines", "Shared across LANs?", "Example standards"],
          rows: [
            ["LLC", "Flow control, error control, framing", "Yes — one LLC for all IEEE LANs", "IEEE 802.2"],
            ["MAC", "The specific media access method", "No — one per LAN technology", "802.3 (CSMA/CD), 802.5 (token), 802.11 (CSMA/CA)"],
          ],
        },
        {
          type: "h3",
          text: "Additive depth: how the working groups map onto the OSI model",
        },
        {
          type: "p",
          text: "The 802 project is organised as numbered working groups, and the number after 802 tells you which technology a document governs. Group 802.1 handles bridging and network management at the boundaries of the LAN; group 802.2 writes the Logical Link Control; group 802.3 writes CSMA/CD, which is the Ethernet family studied in this module; group 802.4 covers token bus; group 802.5 covers token ring; group 802.6 covers metropolitan-area networks; group 802.11 covers wireless LANs; and group 802.15 covers wireless personal-area networks such as Bluetooth. When a textbook says 'Ethernet', the underlying standard is IEEE 802.3.",
        },
        {
          type: "p",
          text: "The architectural trick of splitting the data-link layer is worth stating precisely, because exam questions like to test it. The IEEE 802 model places LLC directly on top of MAC, and MAC directly on top of the physical layer, so a single frame sent by Ethernet is really a MAC-layer envelope whose payload is an LLC protocol data unit that in turn carries an upper-layer packet. The MAC sublayer adds addressing and the frame check sequence; the LLC sublayer adds the flow and error control that the medium-independent part of the link needs. This is the reason the standard can promise 'a single link-layer control protocol for all IEEE LANs' while still allowing each LAN its own access method.",
        },
        {
          type: "note",
          text: "Exam tip: LLC is the upper sublayer and is common to all IEEE LANs; MAC is the lower sublayer and is technology-specific. If a question asks where the access method is defined, the answer is MAC. If it asks where framing and error control are defined, the answer is LLC.",
        },
        {
          type: "example",
          text: "A lab has an Ethernet segment (802.3) and a legacy token-ring segment (802.5). Which sublayer is identical on both, and which differs?",
          steps: [
            "Logical Link Control (802.2) is identical on both: it supplies the same flow control, error control and framing above each medium.",
            "Media Access Control differs: the Ethernet segment uses CSMA/CD, while the token-ring segment uses token passing.",
            "Consequence: software written to the LLC interface can be moved between the two LAN types without change, but the NIC and its MAC procedures cannot.",
          ],
        },
      ],
    },
    {
      id: "s2",
      title: "Ethernet Origins and Its Design Goals",
      body: [
        {
          type: "fig",
          fig: "m08-p05-ethernet",
          caption: "Slide: the Ethernet LAN and the two names behind it.",
        },
        {
          type: "p",
          text: "The Ethernet LAN was developed in the 1970s by Robert Metcalfe and David Boggs, working on the idea of a broadcast medium shared by many stations. The original Ethernet technology operated at a data rate of 10 Mbps. That single number is the anchor for everything that follows: the frame timing, the minimum frame length and the maximum collision-domain diameter of classic Ethernet are all consequences of running CSMA/CD at 10 million bits per second over a shared coaxial bus.",
        },
        {
          type: "fig",
          fig: "m08-p06-ethernet-characteristics",
          caption: "Slide: Ethernet service characteristics — connectionless, unreliable, with silent frame drops.",
        },
        {
          type: "h3",
          text: "Connectionless and unreliable service",
        },
        {
          type: "list",
          items: [
            "A frame sent is independent of the previous frame and of the next frame, which means there is no connection establishment phase and no connection termination phase.",
            "It is possible for the sender to overwhelm the receiver with frames, which results in dropped frames.",
            "Corrupted frames are also dropped silently — Ethernet performs no retransmission of its own.",
          ],
        },
        {
          type: "p",
          text: "These two properties are deliberate, not defects. Ethernet's designers wanted a link layer with the smallest possible amount of per-frame state so that the NIC could be cheap and fast: a frame either arrives intact or it does not, and the hardware never has to remember what came before. Reliability is pushed upward. If the upper-layer protocol is TCP, lost segments are detected by acknowledgement timeouts and retransmitted; if the upper layer is UDP, the application itself must tolerate loss. This is why Ethernet can be described as unreliable while still delivering perfectly good transport for most traffic.",
        },
        {
          type: "h3",
          text: "Additive depth: where Ethernet sits in the protocol stack",
        },
        {
          type: "p",
          text: "Ethernet is a data-link-layer and physical-layer technology; it does not define routing or end-to-end delivery. Beneath it, the physical layer turns 0s and 1s into line code on copper or light in fibre. Above it, the network layer (typically IP) decides which host should receive a packet, and then hands a datagram to Ethernet with the MAC address of the next hop already resolved. Ethernet's job is narrow and literal: given a payload and a destination MAC address, put those bytes on the wire with a correct preamble, addresses, length or type field and frame check sequence, and let collision-handling logic decide whether the transmission survived.",
        },
        {
          type: "table",
          head: ["Property", "Ethernet behaviour", "Where reliability comes from instead"],
          rows: [
            ["Connection setup", "None — frames are independent", "Not needed; each frame is self-contained"],
            ["Acknowledgements", "None at the link layer", "TCP at the transport layer"],
            ["Error recovery", "None — bad frames are discarded silently", "Upper layers retransmit"],
            ["Ordering", "Not guaranteed by the link layer", "Sequence numbers in upper-layer protocols"],
          ],
        },
        {
          type: "note",
          text: "Exam tip: if a question contrasts Ethernet with a reliable, connection-oriented data-link protocol, the three words to reach for are connectionless, unacknowledged and unreliable — with the reliability delegated upward.",
        },
      ],
    },
    {
      id: "s3",
      title: "The Ethernet Frame Format",
      body: [
        {
          type: "fig",
          fig: "m08-p07-ethernet-characteristics",
          caption: "Slide: the Ethernet frame — preamble, SFD, destination address, source address, type, data and CRC.",
        },
        {
          type: "p",
          text: "The Ethernet frame format is fixed by the IEEE 802.3 standard, so two NICs from different vendors will always agree on where each field begins and ends. Reading left to right, a frame consists of a preamble, a start-of-frame delimiter, a 48-bit destination address, a 48-bit source address, a type or length field, a data field, and a 32-bit cyclic-redundancy-check field. The preamble and the delimiter are consumed by the receiving hardware and never appear to the higher layers.",
        },
        {
          type: "list",
          items: [
            "Preamble — allows synchronisation for the receiver.",
            "Start of Frame Delimiter (SFD) — signals the beginning of the frame proper.",
            "Destination Address — 48-bit destination address.",
            "Source Address — 48-bit source address.",
            "Type — defines the upper-layer protocol whose packet is encapsulated in the frame.",
            "Data — carries data encapsulated from the upper-layer protocols; minimum 46 bytes, maximum 1500 bytes.",
            "CRC — contains error-detection information, in this case a CRC-32.",
          ],
        },
        {
          type: "formula",
          tex: "\\underbrace{7}_{\\text{preamble}} + \\underbrace{1}_{\\text{SFD}} + \\underbrace{6}_{\\text{dest}} + \\underbrace{6}_{\\text{src}} + \\underbrace{2}_{\\text{type}} + \\underbrace{46\\ldots1500}_{\\text{data}} + \\underbrace{4}_{\\text{CRC}}",
          text: "Adding the fields in bytes: 7 preamble + 1 start-of-frame delimiter + 6 destination address + 6 source address + 2 type + 46 to 1500 data + 4 CRC, giving a total frame length of 72 to 1526 bytes on the wire, or 64 to 1518 bytes if the preamble and delimiter are excluded.",
        },
        {
          type: "p",
          text: "Two conventions coexist in the literature and it is important to know which one a question is using. The IEEE 802.3 standard counts the preamble and the start-of-frame delimiter as part of the frame, so the smallest frame is 72 bytes and the largest is 1526 bytes. Many textbooks, including the Forouzan framework these slides follow, define the frame as beginning at the destination address, giving the familiar 64-byte minimum and 1518-byte maximum. Both statements describe the same bits on the wire; only the counting boundary differs.",
        },
        {
          type: "h3",
          text: "Field-by-field detail",
        },
        {
          type: "table",
          head: ["Field", "Size (bytes)", "Purpose", "Notes"],
          rows: [
            ["Preamble", "7", "Bit synchronisation", "Pattern 10101010 repeated; lets the receiver lock its clock to the incoming signal"],
            ["Start of Frame Delimiter", "1", "Marks frame start", "Pattern 10101011 — the final 11 breaks the alternating pattern"],
            ["Destination Address", "6", "Who should receive the frame", "May be unicast, multicast or broadcast"],
            ["Source Address", "6", "Who sent the frame", "Always a unicast address of the transmitting NIC"],
            ["Type / Length", "2", "Upper-layer protocol or payload length", "Values below 1536 are read as length; values at or above are read as EtherType"],
            ["Data", "46–1500", "Encapsulated upper-layer packet", "If the payload is shorter than 46 bytes, padding bytes are added"],
            ["CRC", "4", "Error detection", "CRC-32 computed over destination address through data"],
          ],
        },
        {
          type: "p",
          text: "The preamble deserves a second look because it explains an entire class of exam question. Seven bytes of the alternating pattern 10101010 give the receiver's phase-locked loop roughly 56 bit times of a perfectly periodic waveform to acquire both frequency and phase alignment before any real data arrives. Because the pattern is periodic, the receiver knows exactly what it should be seeing, and any drift shows up immediately as a mismatch. The single byte 10101011 that follows is the only place the pattern is deliberately broken, and that break is precisely the signal that 'the frame starts here'. Physical-layer encoding such as Manchester encoding guarantees frequent transitions anyway, but the preamble adds a deliberate, known preamble to make the acquisition deterministic.",
        },
        {
          type: "example",
          text: "An upper-layer packet placed into Ethernet is 20 bytes long. Describe exactly how it is framed and compute the resulting total frame length on the wire.",
          steps: [
            "The data field must be at least 46 bytes, because that is the minimum required for CSMA/CD to work correctly.",
            "The 20-byte packet is therefore padded with 46 − 20 = 26 bytes of fill, typically zeros.",
            "Frame length without preamble and delimiter = 6 + 6 + 2 + 46 + 4 = 64 bytes.",
            "Add the 7-byte preamble and the 1-byte delimiter to get 72 bytes actually transmitted.",
            "In bits: 72 × 8 = 576 bits, including the 64-bit preamble and delimiter overhead.",
          ],
        },
        {
          type: "note",
          text: "Exam tip: a question that says 'minimum Ethernet frame' without qualification almost always means 64 bytes, which is the frame excluding preamble and SFD. If the answer choices include 72 and 64, read the wording of the question carefully before choosing.",
        },
      ],
    },
    {
      id: "s4",
      title: "Frame Length Limits: Why 64 and 1518 Bytes",
      body: [
        {
          type: "fig",
          fig: "m08-p08-ethernet-characteristics",
          caption: "Slide: frame length restrictions, addressing, and the broadcast nature of Ethernet transmission.",
        },
        {
          type: "p",
          text: "The Ethernet frame has both a floor and a ceiling, and each exists for a different historical reason. The minimum-length restriction is required for the correct operation of CSMA/CD; the maximum-length restriction prevents one station from monopolising the medium, and it also reflects the fact that memory used to be expensive when the standard was written. Both limits are enforced by the NIC, not by the application.",
        },
        {
          type: "h3",
          text: "The minimum length and the collision window",
        },
        {
          type: "p",
          text: "Under CSMA/CD a station must be able to detect a collision before it finishes transmitting. If the frame were shorter than the round-trip propagation time of the worst-case collision domain, a station could finish sending, release the medium and consider the transmission successful without ever learning that a collision occurred far away — and the corrupted frame would never be retransmitted because it was never detected as broken. The standard therefore fixes the minimum transmission time to equal the worst-case round-trip propagation delay, a quantity called the slot time. At 10 Mbps a slot time of 512 bit times equals 51.2 microseconds, and a 512-bit frame is exactly 64 bytes, which is where the famous minimum comes from.",
        },
        {
          type: "formula",
          tex: "T_{\\text{min}} = 2 \\times \\frac{d_{\\text{max}}}{v} \\quad\\Longrightarrow\\quad L_{\\text{min}} = R \\times T_{\\text{min}}",
          text: "The minimum transmission time equals twice the maximum one-way propagation delay of the collision domain, and the minimum frame length in bits equals the data rate multiplied by that time. At 10 Mbps with a 512-bit-time slot, the minimum frame is 512 bits or 64 bytes.",
        },
        {
          type: "example",
          text: "Verify the 64-byte minimum for 10 Mbps Ethernet. The standard permits a maximum collision-domain diameter of about 2500 m and a signal speed of roughly 2 × 10⁸ m/s.",
          steps: [
            "One-way propagation delay = 2500 / (2 × 10⁸) = 12.5 microseconds.",
            "Worst-case round-trip delay = 2 × 12.5 = 25 microseconds. Real 10Base5 networks add repeater and transceiver delays, which the standard folds into a slot time of 51.2 microseconds.",
            "Minimum transmission time must be at least this slot time: 51.2 microseconds.",
            "Minimum frame length = 10 × 10⁶ bit/s × 51.2 × 10⁻⁶ s = 512 bits.",
            "512 bits ÷ 8 = 64 bytes. This is why the data field must be at least 46 bytes: 6 + 6 + 2 + 46 + 4 = 64.",
          ],
        },
        {
          type: "h3",
          text: "The maximum length and fairness",
        },
        {
          type: "p",
          text: "The maximum-length restriction serves a completely different purpose. On a shared medium, a station that could transmit indefinitely would starve every other station; bounding the frame at 1500 bytes of payload guarantees that every station eventually releases the medium and gives others a turn. The standard's own wording on the slide adds the historical motivation plainly: memory has been expensive in the past, so a receiver had to be able to allocate a buffer for the largest possible frame without excessive cost. The same 1500-byte ceiling survives today because it is baked into decades of hardware and MTU conventions.",
        },
        {
          type: "table",
          head: ["Limit", "Value", "Primary reason", "Consequence"],
          rows: [
            ["Minimum frame (no preamble)", "64 bytes", "CSMA/CD collision detection within the slot time", "Short payloads are padded with fill bytes"],
            ["Minimum data field", "46 bytes", "Arithmetic result of the 64-byte floor", "20-byte IP packets are padded to 46 bytes"],
            ["Maximum data field", "1500 bytes", "Fairness and buffer memory cost", "Large packets are fragmented by the network layer"],
            ["Maximum frame (no preamble)", "1518 bytes", "Sum of the field maxima", "Establishes the classic Ethernet MTU"],
          ],
        },
        {
          type: "note",
          text: "Exam tip: 'minimum length is required for the correct operation of CSMA/CD' and 'maximum length prevents one station from monopolising the medium' are two separate one-line answers that are often examined as a pair. Do not swap them.",
        },
      ],
    },
    {
      id: "s5",
      title: "Ethernet Addressing: 48 Bits and Three Transmission Modes",
      body: [
        {
          type: "p",
          text: "Every Ethernet NIC carries an address that is burned into the hardware at manufacture. The address is 48 bits long and is conventionally written in hexadecimal notation as six pairs of digits separated by hyphens or colons, for example 07:01:02:01:2C:4B. Because the address is physical rather than logical, it does not change when a machine moves between networks; a router moves logical (IP) addresses between networks, but the MAC address travels with the card.",
        },
        {
          type: "list",
          items: [
            "The address is burned into the network interface card; it is a physical address, not a logical one.",
            "The address is 48 bits, written in hexadecimal notation.",
            "Data transmission may be unicast, multicast or broadcast.",
            "All data transmission on the medium is broadcast in the sense that every station hears it.",
            "A non-receiving station ignores data not intended for itself.",
            "The broadcast address is all 1s, which in hexadecimal is FF:FF:FF:FF:FF:FF.",
          ],
        },
        {
          type: "formula",
          tex: "48\\ \\text{bits} = 6\\ \\text{bytes} = 12\\ \\text{hex digits} \\quad\\Longrightarrow\\quad 2^{48} \\approx 2.81 \\times 10^{14}\\ \\text{addresses}",
          text: "Forty-eight bits is six bytes or twelve hexadecimal digits, giving about 281 trillion distinct addresses — enough that duplicate burned-in addresses are vanishingly unlikely, which is exactly why the standard does not require global registration of every NIC.",
        },
        {
          type: "h3",
          text: "How the first bits classify an address",
        },
        {
          type: "p",
          text: "The type of a destination address is encoded in the most significant bits of the most significant byte. If the lowest-order bit of the first octet is 0, the address is a unicast address belonging to exactly one interface. If that bit is 1, the address is a multicast address belonging to a group of interfaces. The broadcast address is the special case of the all-ones address FF:FF:FF:FF:FF:FF, which every station on the LAN accepts. A second bit, the next one up, distinguishes globally administered (burned-in) addresses from locally administered ones, which is how virtual machines and some routers assign their own MAC addresses.",
        },
        {
          type: "table",
          head: ["Address type", "First-octet bit pattern", "Meaning", "Example"],
          rows: [
            ["Unicast", "Least significant bit of first octet = 0", "One specific interface", "07:01:02:01:2C:4B"],
            ["Multicast", "Least significant bit of first octet = 1", "A group of interfaces", "01:00:5E:00:00:01"],
            ["Broadcast", "All 48 bits = 1", "Every interface on the LAN", "FF:FF:FF:FF:FF:FF"],
          ],
        },
        {
          type: "example",
          text: "Classify the destination addresses 4A:30:10:21:10:1A, 47:20:1B:2E:08:EE and FF:FF:FF:FF:FF:FF.",
          steps: [
            "Convert the first octet of each to binary. 4A = 0100 1010; its least significant bit is 0, so 4A:30:10:21:10:1A is unicast.",
            "47 = 0100 0111; its least significant bit is 1, so 47:20:1B:2E:08:EE is multicast.",
            "FF = 1111 1111 for every octet, so FF:FF:FF:FF:FF:FF is the all-ones broadcast address accepted by every station.",
          ],
        },
        {
          type: "h3",
          text: "Additive depth: the medium is shared, the filtering is local",
        },
        {
          type: "p",
          text: "The slide makes two statements that seem to contradict each other until you separate the medium from the interface. Transmission is broadcast in the physical sense: on a shared coaxial bus or through a hub, every station's electrical signal reaches every other station's receiver, because there is only one electrical medium. Filtering happens at the NIC, which compares the destination address of each arriving frame against its own burned-in address and against the multicast group addresses it has joined, and discards frames that match neither. So a shared Ethernet LAN is logically a broadcast bus with per-station address filters, which is exactly why one misbehaving station transmitting at full rate degrades everyone — the shared medium is genuinely shared.",
        },
        {
          type: "note",
          text: "Exam tip: the unicast/multicast distinction lives in one single bit — the least significant bit of the first octet. Multicast addresses are odd in their first hexadecimal digit's low nibble (01, 03, 05, …, FF); unicast addresses are even (02, 04, …, FE) when read as the low bit of the first octet.",
        },
      ],
    },
    {
      id: "s6",
      title: "The Ethernet Access Method: CSMA/CD with 1-Persistence",
      body: [
        {
          type: "fig",
          fig: "m08-p09-ethernet-access-method",
          caption: "Slide: Ethernet uses CSMA/CD with the 1-persistent method, and Manchester encoding at the physical layer.",
        },
        {
          type: "p",
          text: "Ethernet uses CSMA/CD — Carrier Sense Multiple Access with Collision Detection — operating in the 1-persistent mode, and at the physical layer it uses Manchester encoding. CSMA means that every station with something to send first listens to the medium; multiple access means that the medium is shared and no station has priority; collision detection means that a transmitting station keeps listening and aborts the moment it hears its own signal corrupted by another station's.",
        },
        {
          type: "list",
          items: [
            "Sense the medium: if the channel is idle, transmit immediately with probability 1 — that is what 1-persistent means.",
            "If the channel is busy, keep sensing until it becomes idle, then transmit immediately.",
            "While transmitting, continue to listen; if the received signal differs from the transmitted signal, a collision has occurred.",
            "On collision, abort the transmission and send a jam signal so that all other stations also notice the collision.",
            "Wait a random back-off time chosen by binary exponential back-off, then try again.",
          ],
        },
        {
          type: "h3",
          text: "Why 1-persistent behaves the way it does",
        },
        {
          type: "p",
          text: "Under a 1-persistent strategy a station that finds the medium idle transmits with probability 1, and a station that finds it busy waits and then transmits immediately when it becomes free. This gives the lowest possible idle-channel delay, but it also creates the highest possible collision rate: if several stations are all waiting on a busy medium, they all pounce the instant it goes quiet. The persistence parameter is a direct trade-off between delay and collisions — non-persistent CSMA spreads the retries and collides less but wastes idle time, and p-persistent CSMA attempts a probabilistic compromise. Ethernet's choice of 1-persistent reflects the fact that with binary exponential back-off the collisions are quickly damped out, so it buys low delay for little cost.",
        },
        {
          type: "formula",
          tex: "\\text{slot time} = 2 \\times t_{\\text{prop, max}} \\quad\\text{and}\\quad \\text{back-off} = k \\times \\text{slot time},\\ k \\in \\{0,\\dots,2^{\\,n}-1\\}",
          text: "The slot time is twice the maximum one-way propagation delay, and the back-off a station waits after the n-th consecutive collision is a random multiple k of that slot time, with k drawn from 0 to 2ⁿ − 1 and the range capped at 1024 attempts of ten consecutive collisions.",
        },
        {
          type: "p",
          text: "Binary exponential back-off is the calming mechanism that keeps a shared Ethernet usable. After the first collision a station picks k from {0, 1}, so it waits 0 or 1 slot times; after the second, from {0, 1, 2, 3}; after the fifth, from a set of 32 possibilities. The expected wait grows geometrically, so a congested LAN quickly separates the contenders in time rather than letting them collide repeatedly. After sixteen consecutive collisions, however, the standard gives up and reports the frame as lost, which appears to the upper layers as an ordinary packet drop.",
        },
        {
          type: "example",
          text: "A station has already collided twice in succession. What is the set of possible back-off delays in slot times, and what are the actual delays at 10 Mbps?",
          steps: [
            "After the second collision the random value k is drawn from {0, 1, 2, 3}, giving 2² = 4 choices.",
            "One slot time at 10 Mbps is 51.2 microseconds.",
            "Possible waits are therefore 0, 51.2, 102.4 and 153.6 microseconds.",
            "The station chooses one uniformly at random, which on average is 1.5 slot times or about 76.8 microseconds.",
          ],
        },
        {
          type: "h3",
          text: "Additive depth: Manchester encoding and the self-clocking requirement",
        },
        {
          type: "p",
          text: "CSMA/CD depends on carrier sense, and carrier sense only works if the receiver can always recover the transmitter's clock from the waveform. Manchester encoding provides that guarantee by forcing a transition in the middle of every bit interval: a 0 is a high-to-low transition and a 1 is a low-to-high transition, so the clock is present in the signal itself regardless of the data pattern. The price is that every bit occupies two signal elements, so 10 Mbps Ethernet actually runs at 20 megabaud on the cable — a 20 MHz bandwidth demand for a 10 Mbps payload. This is a textbook illustration of the general rule that the required bandwidth of a self-clocking line code is twice the bit rate.",
        },
        {
          type: "table",
          head: ["Encoding", "Transition per bit", "Bandwidth for 10 Mbps", "Self-clocking?"],
          rows: [
            ["Manchester", "Guaranteed mid-bit transition", "20 Mbaud, roughly 20 MHz", "Yes — used by 10 Mbps Ethernet"],
            ["NRZ-L", "No guaranteed transition", "10 Mbaud", "No — runs of identical bits lose the clock"],
            ["Differential Manchester", "Guaranteed mid-bit transition only", "20 Mbaud", "Yes — used by token ring"],
          ],
        },
        {
          type: "note",
          text: "Exam tip: the combination to memorise is 'Ethernet uses CSMA/CD with 1-persistence and Manchester encoding'. If a question asks what the physical-layer encoding is for standard 10 Mbps Ethernet, the answer is Manchester; if it asks about the access method, the answer is 1-persistent CSMA/CD.",
        },
      ],
    },
    {
      id: "s7",
      title: "Standard Ethernet Implementations: 10Base5, 10Base2, 10BaseT, 10BaseF",
      body: [
        {
          type: "fig",
          fig: "m08-p10-ethernet-implementations",
          caption: "Slide: the four standard Ethernet implementations at 10 Mbps.",
        },
        {
          type: "p",
          text: "Standard Ethernet is the original 10 Mbps family, and it comes in four implementations whose names encode their properties. The leading 10 is the data rate in megabits per second; the word Base indicates baseband transmission, meaning the digital signal is sent directly on the medium without modulation; and the tail identifies the cable and the maximum segment length. When you can read the notation, an exam question about cabling becomes a lookup rather than a guess.",
        },
        {
          type: "list",
          items: [
            "10Base5 — thick coaxial cable, the original bus implementation, with a 500 m segment limit.",
            "10Base2 — thin coaxial cable, a cheaper bus implementation with a 185 m segment limit.",
            "10BaseT — twisted-pair cable with a star topology around a hub, 100 m per segment.",
            "10BaseF — fibre-optic cable, used for longer runs and noisy environments, up to 2000 m per segment.",
          ],
        },
        {
          type: "table",
          head: ["Notation", "Medium", "Topology", "Max segment", "Notes"],
          rows: [
            ["10Base5", "Thick coaxial", "Bus", "500 m", "Original Ethernet; stations tap the bus via transceivers"],
            ["10Base2", "Thin coaxial", "Bus", "185 m", "Cheaper coax, smaller cable, shorter reach"],
            ["10BaseT", "Twisted pair (UTP)", "Star", "100 m", "Hub at the centre; two pairs, one for each direction"],
            ["10BaseF", "Fibre optic", "Star", "2000 m", "Immune to electrical interference; long runs and backbone use"],
          ],
        },
        {
          type: "p",
          text: "The four implementations differ in the physical layer, but they share a single MAC layer and frame format, which is the point of the IEEE 802.3 standard. A 10Base5 station and a 10BaseT station put the same bits into the same frame structure; only the way those bits are carried differs. This separation of concerns is what allowed Ethernet to migrate from thick coax to twisted pair to fibre across forty years without any change to the frames that applications see.",
        },
        {
          type: "h3",
          text: "Additive depth: bus versus star and the physical meaning of the collision domain",
        },
        {
          type: "p",
          text: "10Base5 and 10Base2 are physically a bus: one long cable with every station tapping into it, so a signal injected anywhere propagates to both ends and every station hears it. 10BaseT and 10BaseF are physically a star: each station has its own cable to a central hub, and the hub repeats whatever it receives on one port out to all the others. Electrically, however, the hub is still a shared bus — a frame arriving at the hub is regenerated onto every other port, so all stations remain in one collision domain and CSMA/CD still governs. Understanding that a hub is a logical bus packaged as a physical star is the key to understanding why switched Ethernet, which removes this sharing, was such a large leap forward.",
        },
        {
          type: "example",
          text: "A network uses 10Base5 coax with four segments joined by repeaters. What is the recommended maximum diameter of the whole collision domain, and why does that number matter?",
          steps: [
            "The classic 10 Mbps Ethernet collision domain is limited to roughly 2500 metres end to end.",
            "Even though a single 10Base5 segment reaches 500 m, repeaters add delay and the standard accounts for them, so domains are built from at most a few segments.",
            "The limit matters because the 64-byte minimum frame was derived from it: 2500 m at 2 × 10⁸ m/s gives 12.5 µs one-way, and the slot time of 51.2 µs covers the round trip plus repeater delays.",
            "Exceeding the diameter would allow a station to finish a short frame before a distant collision reached it, which is the failure the minimum frame length exists to prevent.",
          ],
        },
        {
          type: "note",
          text: "Exam tip: decode the name. 10Base5 = 10 Mbps, baseband, 500 m. 10Base2 = 10 Mbps, baseband, about 185 m (the '2' is loosely '200'). 10BaseT = twisted pair, 100 m. 10BaseF = fibre, 2000 m.",
        },
      ],
    },
    {
      id: "s8",
      title: "Collision Domains and Switched Ethernet",
      body: [
        {
          type: "fig",
          fig: "m08-p11-switched-ethernet",
          caption: "Slide: switched Ethernet began with bridged Ethernet, raising bandwidth and separating collision domains.",
        },
        {
          type: "p",
          text: "Switched Ethernet began with bridged Ethernet, and its two stated aims were to raise the available bandwidth and to separate collision domains. A bridge forwards a frame to another collision domain based on MAC address, which means traffic between two stations on different bridge ports no longer competes with traffic on other ports. Later, the switch went further and provided one collision domain per port.",
        },
        {
          type: "list",
          items: [
            "Bridged Ethernet separated one large collision domain into several smaller ones.",
            "A bridge forwards a frame to another collision domain based on the destination MAC address.",
            "A switch is effectively a multi-port bridge and provides one collision domain per port.",
            "Because each port is its own collision domain, stations on different ports cannot collide with each other.",
            "With only one station per port in full-duplex mode, collisions disappear entirely and CSMA/CD is no longer needed.",
          ],
        },
        {
          type: "formula",
          tex: "\\text{Bandwidth per station} = \\frac{B}{N}\\ \\text{(shared)} \\quad\\text{versus}\\quad B\\ \\text{per port (switched)}",
          text: "On a shared hub with bandwidth B and N active stations, each station averages B divided by N. On a switch, every port gets the full bandwidth B to itself, because the ports do not contend for a common medium.",
        },
        {
          type: "p",
          text: "The arithmetic of this change is dramatic and worth working through. Ten stations sharing a 10 Mbps hub means roughly 1 Mbps each in the best case, before any collision overhead. The same ten stations on a 10 Mbps switch, each on its own port, each get a full 10 Mbps when talking to the switch, and the aggregate switching capacity is ten times the port rate — a concept called the switch fabric bandwidth. Collisions vanish because there is no longer any shared electrical medium on which two transmissions can overlap, which is why switched Ethernet removes CSMA/CD from the picture on full-duplex links.",
        },
        {
          type: "h3",
          text: "Additive depth: how a switch builds its forwarding table",
        },
        {
          type: "p",
          text: "A switch learns the topology of the LAN without any configuration, a behaviour called transparent bridging. When a frame arrives on a port, the switch records the frame's source MAC address in its forwarding table together with the port number and a timestamp, because the source address tells it where that station lives. It then looks up the destination address: if that address is already in the table, the frame is forwarded out only the matching port; if it is not, the frame is flooded out every port except the one it arrived on, and the reply that eventually comes back teaches the switch the missing entry. Entries that stay silent for a while are aged out, typically after a few minutes, so that a station moved to a different port is relearned rather than mis-delivered forever.",
        },
        {
          type: "table",
          head: ["Device", "Collision domains", "Broadcast domains", "Forwards on"],
          rows: [
            ["Hub", "One shared domain for all ports", "One for all ports", "Electrically repeats to every port"],
            ["Bridge", "One per port", "One for all ports", "MAC address, learned by inspecting source addresses"],
            ["Switch", "One per port", "One for all ports unless VLANs are used", "MAC address, via the forwarding table"],
            ["Router", "One per interface", "One per interface", "IP address, using the routing table"],
          ],
        },
        {
          type: "example",
          text: "A 24-port switch has a forwarding table containing only the entry for station A on port 3. Station A sends a frame to station B, which has never transmitted.",
          steps: [
            "The switch records nothing new for A — A is already known to be on port 3.",
            "It looks up B and finds no entry, so the frame is flooded out ports 1, 2 and 4 through 24, but not port 3.",
            "Every station hears the frame; only B accepts it, because the other NICs discard a unicast address that is not theirs.",
            "When B replies, the switch learns B's address and port from the reply's source field and adds the entry, so future frames to B are forwarded only out B's port.",
          ],
        },
        {
          type: "note",
          text: "Exam tip: a switch separates collision domains but not broadcast domains; a router separates both. Also remember that the switch learns from the source address and forwards on the destination address — reversing those two verbs in an answer loses the mark.",
        },
      ],
    },
    {
      id: "s9",
      title: "Full-Duplex and Half-Duplex Operation",
      body: [
        {
          type: "p",
          text: "Every Ethernet link operates in one of two duplex modes, and the choice of mode determines whether CSMA/CD is needed at all. In half-duplex mode a station can either transmit or receive but not both at once, because the medium is shared and simultaneous transmission from two stations would collide. In full-duplex mode the transmit and receive paths are separate — separate wire pairs on twisted pair, or separate fibres in a fibre-optic link — so a station can send and receive simultaneously without any possibility of collision.",
        },
        {
          type: "list",
          items: [
            "Half-duplex: one direction at a time, shared medium, CSMA/CD required, capacity shared among stations.",
            "Full-duplex: both directions at once, dedicated point-to-point link, no collisions, CSMA/CD disabled.",
            "Full-duplex requires a switch rather than a hub, or a direct connection between two stations, because the paths must be physically separate.",
            "A full-duplex 100 Mbps link can carry 100 Mbps in each direction, giving an effective bidirectional capacity of 200 Mbps.",
          ],
        },
        {
          type: "formula",
          tex: "C_{\\text{full-duplex}} = 2 \\times B \\quad\\text{(one $B$ per direction)} \\qquad\\text{ versus }\\qquad C_{\\text{half-duplex}} \\le B",
          text: "A full-duplex link carries the full bandwidth B independently in each direction, so its aggregate capacity is twice B. A half-duplex link carries at most B in total, shared between the two stations and reduced further by collisions and back-off.",
        },
        {
          type: "example",
          text: "A file server is connected by a 100 Mbps full-duplex link to a switch. A client downloads a 300 MB file. Ignoring all overhead, how long does the transfer take?",
          steps: [
            "300 MB = 300 × 8 = 2400 megabits.",
            "Full duplex means the server's transmit direction runs at the full 100 Mbps, unaffected by any traffic it receives.",
            "Time = 2400 / 100 = 24 seconds.",
            "Had the link been half-duplex and contended, the achievable rate would have been lower and collisions would have added further delay.",
          ],
        },
        {
          type: "h3",
          text: "Additive depth: why the mode changed the standard",
        },
        {
          type: "p",
          text: "Duplex mode is not a minor detail; it is one of the two great dividing lines in Ethernet's history. In the shared-bus era every link was half-duplex by construction, so CSMA/CD and its 64-byte minimum frame were unavoidable. Once switches gave each station a dedicated point-to-point segment, full duplex became possible and the entire collision machinery could be switched off: no carrier sense, no collision detection, no back-off, no minimum length dictated by propagation delay. This is why a modern full-duplex Ethernet link can use frames far smaller than 64 bytes in special cases and why the practical throughput of a switched network approaches the theoretical port rate. Half-duplex survives today mainly as a negotiated fallback when autonegotiation fails or when a station is connected through a shared hub.",
        },
        {
          type: "table",
          head: ["Property", "Half-duplex", "Full-duplex"],
          rows: [
            ["Directions at once", "One", "Both simultaneously"],
            ["Medium", "Shared", "Dedicated point-to-point"],
            ["CSMA/CD", "Active and required", "Disabled — collisions cannot occur"],
            ["Typical device", "Hub", "Switch or direct link"],
            ["Aggregate capacity", "At most B, shared", "2 × B"],
          ],
        },
        {
          type: "note",
          text: "Exam tip: collisions require a shared medium. If a link is full duplex, no collision is physically possible, so any answer that mentions CSMA/CD back-off on a full-duplex link is wrong.",
        },
      ],
    },
    {
      id: "s10",
      title: "Fast Ethernet at 100 Mbps",
      body: [
        {
          type: "fig",
          fig: "m08-p12-fast-ethernet",
          caption: "Slide: Fast Ethernet runs at 100 Mbps, uses a hub or switch design, stays compatible with standard Ethernet, and supports auto-negotiation.",
        },
        {
          type: "p",
          text: "Fast Ethernet raised the data rate from 10 Mbps to 100 Mbps while remaining compatible with standard Ethernet at the frame level. It uses a hub or switch design and includes a feature for auto-negotiation. Because the frame format is unchanged, a station can upgrade a segment from 10 to 100 Mbps without altering any software above the NIC driver, which is exactly the compatibility the standard promised.",
        },
        {
          type: "list",
          items: [
            "Data rate of 100 Mbps — a tenfold increase over standard Ethernet.",
            "Uses a hub or switch design, retaining the star topology with twisted pair at the centre.",
            "Compatible with standard Ethernet: the frame format is unchanged.",
            "Supports auto-negotiation, so two devices can agree on the best common speed and duplex mode.",
          ],
        },
        {
          type: "h3",
          text: "Auto-negotiation and how it works",
        },
        {
          type: "p",
          text: "Auto-negotiation lets two neighbouring devices discover the highest performance they both support and configure themselves accordingly. At startup each device transmits a burst of link-pulse information that advertises its supported speeds and duplex modes, and both sides then settle on the best mutual setting. This is why you can plug an old 10 Mbps card into a modern switch port and it simply works, at 10 Mbps. The failure mode is worth remembering: if auto-negotiation is disabled on one side and left on for the other, the two ends can end up in a duplex mismatch, a condition that produces errors and terrible performance without any cable fault being present.",
        },
        {
          type: "table",
          head: ["Implementation", "Medium", "Encoding", "Line rate", "Max segment"],
          rows: [
            ["100Base-TX", "Two pairs of category 5 UTP or STP", "4B/5B with MLT-3", "125 Mbaud", "100 m"],
            ["100Base-FX", "Two strands of fibre optic", "4B/5B with NRZ-I", "125 Mbaud", "412 m half duplex, 2000 m full duplex"],
            ["100Base-T4", "Four pairs of category 3 UTP", "8B/6T", "25 Mbaud per pair", "100 m"],
          ],
        },
        {
          type: "formula",
          tex: "R_{\\text{line}} = R_{\\text{data}} \\times \\frac{5}{4} = 100\\ \\text{Mbps} \\times 1.25 = 125\\ \\text{Mbaud}",
          text: "4B/5B encoding replaces every four data bits with a five-bit code group that is guaranteed to have enough transitions for clock recovery. The line rate is therefore five quarters of the data rate: 100 Mbps of data needs 125 megabaud on the wire.",
        },
        {
          type: "h3",
          text: "Additive depth: why 4B/5B was needed",
        },
        {
          type: "p",
          text: "Manchester encoding was perfectly adequate at 10 Mbps but became wasteful at 100 Mbps, because it demands a bandwidth of twice the bit rate — a 100 Mbps Manchester signal would need 200 MHz of channel, which category 5 twisted pair cannot deliver over 100 metres. The designers therefore changed the encoding strategy. 4B/5B maps each group of four data bits to a five-bit code word chosen so that no more than three consecutive zeros ever appear; the resulting stream still has enough transitions for clock recovery, but it needs only 25 percent overhead instead of 100 percent. The 125 Mbaud stream is then placed on the wire with MLT-3, a three-level line code that concentrates most of its energy below about 31 MHz, comfortably inside what category 5 cable can carry. This combination of block coding plus a bandwidth-efficient line code is the standard pattern reused at every higher Ethernet speed.",
        },
        {
          type: "example",
          text: "A 100Base-TX link carries 100 Mbps of payload data. What is the actual signal rate on the wire, and how much of it is encoding overhead?",
          steps: [
            "4B/5B coding turns every 4 data bits into 5 code bits, so the line rate is 100 × 5/4 = 125 Mbaud.",
            "The overhead is the difference: 125 − 100 = 25 Mbaud, which is exactly 20 percent of the data rate.",
            "Expressed as bits per second of wasted capacity, 25 percent of the transmitted code groups carry no payload.",
            "Despite that overhead, 4B/5B is still cheaper than Manchester, which would have required 200 Mbaud — a 100 percent overhead the cable could not support.",
          ],
        },
        {
          type: "note",
          text: "Exam tip: 100Base-TX is 100 Mbps, baseband, twisted pair, 100 m. The encoding is 4B/5B with MLT-3, giving a 125 Mbaud line rate. If a question asks what limits the segment to 100 m, the answer is the twisted-pair channel's bandwidth and attenuation, not the encoding.",
        },
      ],
    },
    {
      id: "s11",
      title: "Gigabit Ethernet at 1000 Mbps",
      body: [
        {
          type: "fig",
          fig: "m08-p13-gigabit-ethernet",
          caption: "Slide: Gigabit Ethernet has full-duplex and half-duplex modes, a 512-byte minimum frame and frame bursting.",
        },
        {
          type: "p",
          text: "Gigabit Ethernet upgraded the data rate to 1000 Mbps and offers two operating modes. In full-duplex mode it uses a switch and no longer uses CSMA/CD, because the medium is dedicated and collisions cannot happen. In half-duplex mode it still uses CSMA/CD, and to make collision detection work at a thousand megabits per second the standard increases the minimum frame size to 512 bytes and allows a technique called frame bursting.",
        },
        {
          type: "list",
          items: [
            "Data rate raised to 1000 Mbps — Gigabit Ethernet.",
            "Full-duplex mode uses a switch and no longer uses CSMA/CD.",
            "Half-duplex mode still uses CSMA/CD.",
            "The minimum frame size in half-duplex mode is increased to 512 bytes.",
            "Frame bursting is allowed, so several short frames can be sent back to back in one acquired transmission.",
          ],
        },
        {
          type: "h3",
          text: "Why the minimum frame grew to 512 bytes",
        },
        {
          type: "p",
          text: "At 10 Mbps a 64-byte frame takes 51.2 microseconds to transmit, which comfortably exceeds the round-trip propagation delay of the collision domain. At 1000 Mbps the same 64 bytes take only 512 nanoseconds, but the wire is still hundreds of metres long and the round trip still takes microseconds. A station would therefore finish transmitting long before a distant collision could reach it, defeating collision detection. The standard solves this by stretching the minimum transmission unit in half-duplex operation to 512 bytes, which at 1000 Mbps occupies 4.096 microseconds — long enough to cover the round trip. Full-duplex links are exempt, because they have no collisions to detect.",
        },
        {
          type: "formula",
          tex: "T_{\\text{min}} = \\frac{L_{\\text{min}}}{R} = \\frac{512 \\times 8}{1000 \\times 10^{6}} = 4.096\\ \\mu\\text{s}",
          text: "In half-duplex Gigabit Ethernet the minimum frame of 512 bytes equals 4096 bits, and at 1000 Mbps that occupies 4.096 microseconds — the slot time that must exceed the round-trip propagation delay of the collision domain.",
        },
        {
          type: "h3",
          text: "Frame bursting and carrier extension",
        },
        {
          type: "p",
          text: "Increasing the minimum frame to 512 bytes creates a new problem: a genuinely short frame of, say, 100 bytes would have to be padded out to 512 bytes and 412 bytes of padding would cross the wire for nothing. The standard offers two remedies. Carrier extension pads the transmission with special extension symbols so that the medium is busy for the full slot time even when the frame is short. Frame bursting goes further: a station that has acquired the medium transmits a burst of several short frames back to back, with no interframe padding and no re-contention between them, and the total burst is long enough to satisfy the slot time. Bursting therefore preserves CSMA/CD's guarantees while recovering the efficiency that a 512-byte minimum frame would otherwise destroy.",
        },
        {
          type: "example",
          text: "A half-duplex Gigabit Ethernet station wants to send ten 100-byte frames. Compare transmitting them separately with transmitting them as one burst.",
          steps: [
            "Separately, each 100-byte frame must be padded to the 512-byte minimum, so each transmission occupies 512 bytes and the ten frames carry 1000 useful bytes out of 5120 transmitted — under 20 percent efficiency.",
            "As a burst, the ten frames are sent back to back with no padding between them, giving 10 × 100 = 1000 bytes of payload inside one acquisition of the medium.",
            "The whole burst is well over the 512-byte slot time, so collision detection still works correctly.",
            "The efficiency approaches the ratio of payload to frame overhead instead of being crushed by padding, which is the entire point of frame bursting.",
          ],
        },
        {
          type: "table",
          head: ["Implementation", "Medium", "Encoding", "Line rate", "Max segment"],
          rows: [
            ["1000Base-SX", "Short-wavelength multimode fibre", "8B/10B", "1250 Mbaud", "550 m"],
            ["1000Base-LX", "Long-wavelength single or multimode fibre", "8B/10B", "1250 Mbaud", "5000 m single mode"],
            ["1000Base-CX", "Shielded copper jumper cable", "8B/10B", "1250 Mbaud", "25 m"],
            ["1000Base-T", "Four pairs of category 5e UTP", "4D-PAM5", "125 Mbaud per pair", "100 m"],
          ],
        },
        {
          type: "formula",
          tex: "R_{\\text{line}} = 1000\\ \\text{Mbps} \\times \\frac{10}{8} = 1250\\ \\text{Mbaud}",
          text: "8B/10B block coding maps eight data bits to ten code bits, so Gigabit Ethernet over fibre or shielded copper runs at 1250 megabaud — 25 percent more symbols per second than the data rate, the same overhead fraction used by 4B/5B in Fast Ethernet.",
        },
        {
          type: "note",
          text: "Exam tip: the number to remember for Gigabit Ethernet is 512 bytes — the enlarged minimum frame in half-duplex mode. Full-duplex Gigabit Ethernet keeps the ordinary 64-byte minimum because CSMA/CD is not in use there.",
        },
      ],
    },
    {
      id: "s12",
      title: "10 Gigabit Ethernet and Beyond",
      body: [
        {
          type: "p",
          text: "Following the same tenfold climb, 10 Gigabit Ethernet runs at 10,000 Mbps. By this generation the original design constraints have been abandoned entirely: 10 Gigabit Ethernet is defined only for full-duplex operation over point-to-point links, so CSMA/CD does not exist at this speed and the enlarged minimum frame of half-duplex Gigabit Ethernet is gone. The frame format is still the familiar 802.3 format, which is what allows a 10 Gbps backbone link to carry traffic from 10 Mbps and 100 Mbps access links without translation.",
        },
        {
          type: "list",
          items: [
            "Data rate of 10,000 Mbps, ten times Gigabit Ethernet.",
            "Full-duplex only — CSMA/CD is not used at all.",
            "Designed for point-to-point links over fibre, with copper variants for short runs.",
            "Uses the same frame format, so it interworks with every earlier Ethernet generation.",
            "Typically deployed as a backbone or server-uplink technology rather than to the desktop.",
          ],
        },
        {
          type: "table",
          head: ["Implementation", "Medium", "Typical reach", "Typical use"],
          rows: [
            ["10GBASE-SR", "Multimode fibre, short reach", "Up to about 400 m", "Data-centre links"],
            ["10GBASE-LR", "Single-mode fibre, long reach", "Up to about 10 km", "Campus backbones"],
            ["10GBASE-ER", "Single-mode fibre, extended reach", "Up to about 40 km", "Metropolitan links"],
            ["10GBASE-T", "Twisted pair, category 6a or better", "Up to 100 m", "Server and rack connections"],
          ],
        },
        {
          type: "h3",
          text: "Additive depth: the trend line across the generations",
        },
        {
          type: "p",
          text: "Looked at together, the Ethernet generations tell one coherent story: the data rate rises by a factor of ten each time, the encoding scheme becomes more elaborate to keep the line rate within what the cable can carry, and the dependence on CSMA/CD steadily disappears. Standard Ethernet at 10 Mbps used Manchester encoding over a shared medium. Fast Ethernet at 100 Mbps kept the shared medium but switched to 4B/5B so that twisted pair could cope. Gigabit Ethernet at 1000 Mbps added 8B/10B and made full duplex the dominant mode, retaining CSMA/CD only as a half-duplex fallback with an enlarged minimum frame. Ten Gigabit Ethernet at 10,000 Mbps dropped half duplex entirely. The frame never changed, which is why the world could upgrade its infrastructure a generation at a time without breaking anything that ran on top.",
        },
        {
          type: "formula",
          tex: "\\frac{R_{10\\text{G}}}{R_{10\\text{Base}}} = \\frac{10\\,000\\ \\text{Mbps}}{10\\ \\text{Mbps}} = 1000",
          text: "From standard Ethernet to 10 Gigabit Ethernet the data rate has increased by a factor of one thousand, while the frame format has remained the IEEE 802.3 format unchanged.",
        },
        {
          type: "example",
          text: "A data centre needs to connect two racks 250 metres apart with 10 Gbps of capacity. Which implementation family fits, and why not one of the others?",
          steps: [
            "10GBASE-T over category 6a twisted pair is limited to about 100 m, so 250 m is out of reach.",
            "10GBASE-SR over multimode fibre reaches roughly 400 m, so it comfortably covers 250 m and is the economical choice for inside a building.",
            "10GBASE-LR over single-mode fibre would also work but reaches 10 km, which is far more range than needed and costs more in optics.",
            "Conclusion: choose short-reach multimode fibre at 250 m; match reach to need rather than overspecifying.",
          ],
        },
        {
          type: "note",
          text: "Exam tip: after Gigabit Ethernet, remember that half duplex and CSMA/CD are gone. Any answer that puts CSMA/CD in a 10 Gigabit Ethernet question is wrong, because the standard is full-duplex point-to-point only.",
        },
      ],
    },
    {
      id: "s13",
      title: "ARP, the MAC Address and Address Resolution",
      body: [
        {
          type: "p",
          text: "A MAC address identifies an interface on a LAN, but applications address each other with logical IP addresses instead. Address Resolution Protocol bridges the gap: given the IP address of a host on the same LAN, ARP discovers the corresponding MAC address so that the frame can be addressed and delivered. Without ARP, an IP packet could be routed all the way to the correct network and then be unable to find the correct machine, because the link layer only understands hardware addresses.",
        },
        {
          type: "list",
          items: [
            "ARP maps a known logical (IP) address to an unknown physical (MAC) address on the same LAN.",
            "The sender broadcasts an ARP request asking who owns a given IP address; every station on the LAN receives it.",
            "Only the station whose IP address matches replies, and it replies with a unicast frame carrying its MAC address.",
            "The sender caches the mapping so that subsequent frames can be addressed without another broadcast.",
            "A gratuitous ARP announces a station's own mapping and is used to detect duplicate addresses.",
          ],
        },
        {
          type: "h3",
          text: "Worked ARP exchange",
        },
        {
          type: "p",
          text: "Suppose station A with IP 192.168.1.10 and MAC 4A:30:10:21:10:1A wants to send a packet to station B with IP 192.168.1.20 but does not know B's MAC address. A broadcasts an ARP request whose destination MAC address is FF:FF:FF:FF:FF:FF and whose payload asks 'who has 192.168.1.20?'. Every NIC on the LAN accepts the broadcast frame and passes it up to the ARP module; the ARP modules of stations with different IP addresses discard the request silently, and only B responds. B sends a unicast ARP reply back to A's MAC address stating that 192.168.1.20 is at, say, 7A:20:1B:2E:08:EE. A stores that pair in its ARP cache and then sends the actual data frame directly to B's MAC address.",
        },
        {
          type: "table",
          head: ["Frame", "Destination MAC", "Purpose"],
          rows: [
            ["ARP request", "FF:FF:FF:FF:FF:FF (broadcast)", "Ask every station on the LAN who owns a given IP address"],
            ["ARP reply", "Sender's unicast MAC address", "Tell the requester the MAC address that owns that IP address"],
            ["Data frame after resolution", "Target's unicast MAC address", "Deliver the actual upper-layer payload"],
          ],
        },
        {
          type: "h3",
          text: "Additive depth: local versus remote destinations",
        },
        {
          type: "p",
          text: "A subtlety that exam questions exploit is that ARP is only used for destinations on the same LAN. If the destination IP address is on a different network, the sender does not ARP for the far host; it ARPs for its default gateway, because the frame must first be delivered to the router's MAC address. The router then strips that frame, consults its routing table, and builds a fresh frame for the next hop with the next hop's MAC address. The IP address stays the same from source to destination, but the MAC addresses change at every hop, which is the clearest possible demonstration that an IP address is end-to-end while a MAC address is local to a link.",
        },
        {
          type: "note",
          text: "Exam tip: ARP resolves a known IP address into a MAC address, and it runs only within a broadcast domain. If a question involves a destination on a different subnet, the correct answer is that the sender ARPs for the gateway rather than the final host.",
        },
      ],
    },
    {
      id: "s14",
      title: "Switches, Bridges and the Forwarding Table",
      body: [
        {
          type: "p",
          text: "Transparent bridging is the mechanism that lets a switch or bridge connect LAN segments into one logical LAN without any station knowing the bridge exists. The device learns which MAC addresses live behind which ports, and it uses that knowledge to forward each frame only where it needs to go. From the perspective of the stations, the bridged network behaves as a single Ethernet, which is exactly what transparency means.",
        },
        {
          type: "list",
          items: [
            "Learning: the switch inspects each arriving frame's source MAC address and records it against the port it arrived on.",
            "Forwarding: the switch looks up the destination MAC address and transmits the frame only out the matching port.",
            "Flooding: if the destination is unknown, the frame is sent out every port except the one it arrived on.",
            "Filtering: if the source and destination are on the same port, the frame is discarded because it has already reached its destination segment.",
            "Ageing: entries not refreshed within a timeout are removed, so moved stations are relearned.",
          ],
        },
        {
          type: "formula",
          tex: "\\sum_{i=1}^{N} B_i \\quad\\text{where each port runs at its own rate } B_i",
          text: "The aggregate capacity of a switch is the sum of the rates of its ports, because each port is an independent collision domain and can transmit simultaneously with every other port.",
        },
        {
          type: "example",
          text: "A switch has three stations: A on port 1, B on port 2, and C on port 3. Its table currently holds A→1, B→2 and C→3. Describe the path of (a) a frame from A to B, (b) a frame from B to B's own segment, and (c) a broadcast frame from C.",
          steps: [
            "(a) The destination is known to be on port 2, so the switch forwards the frame out port 2 only. Ports 1 and 3 see nothing.",
            "(b) The source and destination resolve to the same port, so the frame is filtered and no port forwards it — it has already reached the right segment.",
            "(c) A broadcast destination matches every entry, so the frame is flooded out ports 1 and 2, but not out port 3, the port it arrived on.",
          ],
        },
        {
          type: "h3",
          text: "Additive depth: loops, storms and the spanning-tree idea",
        },
        {
          type: "p",
          text: "Transparent bridging has one serious failure mode that is worth understanding. If two switches are connected by more than one path, a broadcast frame will be flooded out both paths into an infinite loop, and the network will fill with ever-multiplying copies of the same frame — a broadcast storm. The standard remedy is the spanning tree protocol, under which switches exchange control messages, elect a single root, and dynamically block the redundant ports so that the active topology is a loop-free tree. If a link in that tree fails, the previously blocked ports are opened and the tree is rebuilt. This is why a well-configured switched network can tolerate a redundant cable without the loop that a naive installation would suffer.",
        },
        {
          type: "note",
          text: "Exam tip: remember the four verbs in order — learn from the source, forward on the destination, flood when unknown, filter when source and destination share a port. Ageing is what makes the table adapt when a station moves.",
        },
      ],
    },
  ],
  flashcards: [
    {
      q: "When did Project 802 start, and who started it?",
      a: "Project 802 started in 1985 and was started by the IEEE Computer Society, to set standards that would enable intercommunication among equipment from a variety of manufacturers.",
      sec: "s1",
    },
    {
      q: "Does Project 802 replace any part of the OSI model or the TCP/IP suite?",
      a: "No. Project 802 does not seek to replace any part of the OSI model or the TCP/IP protocol suite; its goal is to specify the functions of the physical layer and the data-link layer of major LAN protocols.",
      sec: "s1",
    },
    {
      q: "What does Logical Link Control define, and what does Media Access Control define?",
      a: "LLC is the part of 802 that defines flow control, error control and framing, and it provides a single link-layer control protocol for all IEEE LANs. MAC is the sublayer that defines the specific access method for each LAN.",
      sec: "s1",
    },
    {
      q: "Who developed Ethernet, and what was the original data rate?",
      a: "The Ethernet LAN was developed in the 1970s by Robert Metcalfe and David Boggs. The original Ethernet technology has a data rate of 10 Mbps.",
      sec: "s2",
    },
    {
      q: "What does it mean that Ethernet offers connectionless and unreliable service?",
      a: "A frame sent is independent of the previous or next frame, so there is no connection establishment or termination phase. The sender can overwhelm the receiver and cause dropped frames, and corrupted frames are dropped silently.",
      sec: "s2",
    },
    {
      q: "Name the seven fields of an Ethernet frame in order.",
      a: "Preamble, Start of Frame Delimiter, Destination Address, Source Address, Type, Data and CRC. The preamble and SFD handle synchronisation and frame start; the CRC is a CRC-32.",
      sec: "s3",
    },
    {
      q: "What is the purpose of the preamble and of the start-of-frame delimiter?",
      a: "The preamble allows synchronisation for the receiver, and the start-of-frame delimiter signals the beginning of the frame.",
      sec: "s3",
    },
    {
      q: "What are the minimum and maximum sizes of the Ethernet data field, and why?",
      a: "The data field is a minimum of 46 bytes and a maximum of 1500 bytes. The minimum keeps the frame at 64 bytes so CSMA/CD can detect collisions; the maximum prevents one station from monopolising the medium.",
      sec: "s4",
    },
    {
      q: "Why does Ethernet have a minimum frame-length restriction?",
      a: "The minimum length restriction is required for the correct operation of CSMA/CD: the frame must take long enough to transmit that a collision anywhere in the domain can be detected before the sender finishes.",
      sec: "s4",
    },
    {
      q: "How long is an Ethernet address and how is it written?",
      a: "The address is 48 bits, burned into the NIC, and written in hexadecimal notation — six bytes, or twelve hex digits, such as 07:01:02:01:2C:4B.",
      sec: "s5",
    },
    {
      q: "What is the Ethernet broadcast address, and what do non-receiving stations do?",
      a: "The broadcast address is all 1s, FF:FF:FF:FF:FF:FF. All transmission is broadcast on the medium, but a non-receiving station ignores data not intended for itself.",
      sec: "s5",
    },
    {
      q: "Which access method does Ethernet use, and with which persistence?",
      a: "Ethernet uses CSMA/CD — Carrier Sense Multiple Access with Collision Detection — with the 1-persistent method, and at the physical layer it uses Manchester encoding.",
      sec: "s6",
    },
    {
      q: "What are the four standard Ethernet implementations, and what do their names encode?",
      a: "10Base5, 10Base2, 10BaseT and 10BaseF. The 10 is the 10 Mbps data rate, Base means baseband, and the tail gives the medium and approximate segment length: 500 m coax, 185 m thin coax, twisted pair and fibre.",
      sec: "s7",
    },
    {
      q: "What were the two aims of bridged and switched Ethernet?",
      a: "Switched Ethernet started with bridged Ethernet and aimed to raise the bandwidth and separate collision domains; a bridge forwards a frame to another collision domain based on MAC address, and a switch provides one collision domain per port.",
      sec: "s8",
    },
    {
      q: "What is the difference between half-duplex and full-duplex Ethernet?",
      a: "Half duplex allows one direction at a time over a shared medium and requires CSMA/CD. Full duplex uses a switch with separate transmit and receive paths, so both directions run at once and CSMA/CD is not needed.",
      sec: "s9",
    },
    {
      q: "What are the headline features of Fast Ethernet?",
      a: "Fast Ethernet runs at 100 Mbps, uses a hub or switch design, is compatible with standard Ethernet, and has a feature for auto-negotiation. Its 100Base-TX variant uses 4B/5B coding at a 125 Mbaud line rate.",
      sec: "s10",
    },
    {
      q: "What are the two modes of Gigabit Ethernet?",
      a: "Full-duplex mode uses a switch and no longer uses CSMA/CD; half-duplex mode still uses CSMA/CD and therefore has an increased minimum frame size of 512 bytes. Gigabit Ethernet also allows frame bursting.",
      sec: "s11",
    },
    {
      q: "Why is the half-duplex Gigabit Ethernet minimum frame 512 bytes?",
      a: "At 1000 Mbps a 64-byte frame takes only 512 ns, far less than the round-trip propagation delay, so collision detection would fail. A 512-byte minimum takes 4.096 µs, long enough for the round trip, and frame bursting avoids wasting the padding on short frames.",
      sec: "s11",
    },
    {
      q: "What does ARP do?",
      a: "ARP, the Address Resolution Protocol, resolves a known logical (IP) address on the same LAN into the corresponding physical (MAC) address, by broadcasting a request that only the matching host answers.",
      sec: "s13",
    },
    {
      q: "How does a switch populate its forwarding table?",
      a: "By transparent bridging: it learns the source MAC address of every arriving frame and records it against the arrival port, forwards on the destination address, floods unknown destinations out all other ports, and ages out stale entries.",
      sec: "s14",
    },
  ],
  quiz: [
    {
      q: "Project 802 was started by which body?",
      choices: [
        "The IEEE Computer Society",
        "The Internet Engineering Task Force",
        "The International Organization for Standardization alone",
        "The manufacturers of Ethernet NICs",
      ],
      answer: 0,
      why: "The slide states plainly that Project 802 was started by the IEEE Computer Society in 1985, to standardise the physical and data-link layers of major LAN protocols.",
      sec: "s1",
    },
    {
      q: "Which sublayer of IEEE 802 provides a single link-layer control protocol for all IEEE LANs?",
      choices: ["Media Access Control", "Logical Link Control", "The physical layer", "The network layer"],
      answer: 1,
      why: "Logical Link Control is the part of 802 that defines flow control, error control and framing and gives a single link-layer control protocol for all IEEE LANs; MAC is the technology-specific access-method sublayer.",
      sec: "s1",
    },
    {
      q: "Which statement best describes Ethernet's service to the layer above?",
      choices: [
        "Connection-oriented, reliable and acknowledged",
        "Connectionless and unreliable, with corrupted frames dropped silently",
        "Connectionless but fully reliable, with automatic retransmission",
        "Connection-oriented but unreliable, with no error detection",
      ],
      answer: 1,
      why: "A frame is independent of the previous and next frame, so there is no connection setup or teardown, the sender can overwhelm the receiver, and corrupted frames are dropped silently with no link-layer retransmission.",
      sec: "s2",
    },
    {
      q: "In the Ethernet frame, what is the purpose of the start-of-frame delimiter?",
      choices: [
        "It carries the CRC-32 error-detection value",
        "It signals the beginning of the frame after the preamble",
        "It defines the upper-layer protocol being carried",
        "It pads short payloads up to the minimum length",
      ],
      answer: 1,
      why: "The preamble provides synchronisation and the one-byte start-of-frame delimiter signals the beginning of the frame proper, with the pattern 10101011 breaking the alternating preamble pattern.",
      sec: "s3",
    },
    {
      q: "How many bytes long are the destination and source address fields of an Ethernet frame, and how long is the CRC?",
      choices: [
        "4, 4 and 2 bytes",
        "6, 6 and 4 bytes",
        "8, 8 and 8 bytes",
        "2, 2 and 4 bytes",
      ],
      answer: 1,
      why: "Both the destination and source addresses are 48-bit fields, which is 6 bytes each, and the CRC field is a 4-byte (32-bit) error-detection value.",
      sec: "s3",
    },
    {
      q: "A 30-byte payload is placed into an Ethernet frame. How many bytes of padding are needed, and why?",
      choices: [
        "0 bytes — no padding is required",
        "16 bytes, to reach the 46-byte data-field minimum",
        "30 bytes, to reach the 60-byte data-field minimum",
        "4 bytes, to reach the CRC boundary",
      ],
      answer: 1,
      why: "The data field must be at least 46 bytes so that the whole frame reaches 64 bytes, which CSMA/CD requires. 46 − 30 = 16 bytes of padding.",
      sec: "s4",
    },
    {
      q: "Which statement gives the correct reasons for the two Ethernet frame-length limits?",
      choices: [
        "The minimum prevents monopolisation; the maximum allows collision detection",
        "The minimum allows collision detection under CSMA/CD; the maximum prevents one station from monopolising the medium",
        "Both exist purely to save buffer memory",
        "The minimum saves memory; the maximum keeps the CRC short",
      ],
      answer: 1,
      why: "The slides state that the minimum length restriction is required for correct CSMA/CD operation, while the maximum length prevents one station from monopolising the medium and reflects the cost of memory in the past.",
      sec: "s4",
    },
    {
      q: "An Ethernet destination address begins with the octet 4E. This address is:",
      choices: [
        "Broadcast, because all ones appear",
        "Multicast, because the least significant bit of the first octet is 1",
        "Unicast, because the least significant bit of the first octet is 0",
        "A source address only, never a destination",
      ],
      answer: 2,
      why: "4E in binary is 0100 1110, whose least significant bit is 0, so the address is unicast. A multicast address would have that bit set to 1, and broadcast is the all-ones address FF:FF:FF:FF:FF:FF.",
      sec: "s5",
    },
    {
      q: "How many distinct 48-bit Ethernet addresses are there?",
      choices: ["About 4.3 billion", "About 281 trillion", "About 1 million", "About 65,536"],
      answer: 1,
      why: "2⁴⁸ ≈ 2.81 × 10¹⁴, which is about 281 trillion addresses. About 4.3 billion (2³²) is the size of the IPv4 space and about 65,536 is 2¹⁶.",
      sec: "s5",
    },
    {
      q: "Ethernet uses CSMA/CD with which persistence method and which physical-layer encoding?",
      choices: [
        "Non-persistent CSMA/CD with NRZ-L encoding",
        "1-persistent CSMA/CD with Manchester encoding",
        "p-persistent CSMA/CD with 4B/5B encoding",
        "1-persistent CSMA/CA with Manchester encoding",
      ],
      answer: 1,
      why: "The slide states directly that Ethernet uses CSMA/CD with the 1-persistent method and uses the Manchester encoding method at the physical layer.",
      sec: "s6",
    },
    {
      q: "What is the maximum segment length of 10Base2?",
      choices: ["500 m", "185 m", "100 m", "2000 m"],
      answer: 1,
      why: "10Base2 is thin coaxial cable with a segment limit of 185 m. The 500 m figure belongs to 10Base5, 100 m to 10BaseT twisted pair, and 2000 m to 10BaseF fibre.",
      sec: "s7",
    },
    {
      q: "On a switch, how many collision domains typically exist per port?",
      choices: [
        "None — switches create broadcast domains instead",
        "One dedicated collision domain per port",
        "One shared collision domain for all ports",
        "Two, one for each duplex direction",
      ],
      answer: 1,
      why: "Bridged Ethernet separated collision domains, and the switch went further by providing one collision domain per port, so stations on different ports never contend for a shared medium.",
      sec: "s8",
    },
    {
      q: "A switch receives a frame whose destination MAC address is not in its forwarding table. What does it do?",
      choices: [
        "Discards the frame and sends an error to the sender",
        "Floods the frame out every port except the one it arrived on",
        "Holds the frame until the destination transmits",
        "Forwards the frame out every port including the arrival port",
      ],
      answer: 1,
      why: "Unknown unicast destinations are flooded out all ports except the arrival port, which is how the destination is reached and how the reply subsequently teaches the switch the missing table entry.",
      sec: "s14",
    },
    {
      q: "Why can a full-duplex Ethernet link ignore CSMA/CD?",
      choices: [
        "Because it uses a faster encoding scheme than half-duplex",
        "Because the transmit and receive paths are separate, so a collision is physically impossible",
        "Because it is always a shorter cable than a half-duplex link",
        "Because the frames are padded to 512 bytes",
      ],
      answer: 1,
      why: "Full duplex requires separate paths in each direction, so a station can send and receive at the same time and two transmissions can never overlap on the medium. No collision means no need for carrier sense, collision detection or back-off.",
      sec: "s9",
    },
    {
      q: "What is the line rate of 100Base-TX, and where does the extra rate beyond 100 Mbps come from?",
      choices: [
        "100 Mbaud — there is no encoding overhead",
        "125 Mbaud — 4B/5B coding maps 4 data bits to 5 code bits",
        "200 Mbaud — Manchester encoding doubles the rate",
        "50 Mbaud — 5B/4B coding halves the rate",
      ],
      answer: 1,
      why: "4B/5B replaces every four data bits with a five-bit code group, so the line rate is 100 × 5/4 = 125 Mbaud. The 25 percent overhead buys guaranteed transitions for clock recovery; 200 Mbaud would be the Manchester requirement and was rejected as too expensive.",
      sec: "s10",
    },
    {
      q: "What is the minimum frame size in half-duplex Gigabit Ethernet, and why?",
      choices: [
        "64 bytes, unchanged from standard Ethernet",
        "512 bytes, so the transmission time covers the collision round trip at 1000 Mbps",
        "1500 bytes, to match the maximum payload",
        "72 bytes, counting the preamble and delimiter",
      ],
      answer: 1,
      why: "At 1000 Mbps a 64-byte frame lasts only 512 ns, far shorter than the round-trip propagation delay, so the standard raises the minimum to 512 bytes, which occupies 4.096 µs and keeps collision detection workable.",
      sec: "s11",
    },
    {
      q: "What problem does frame bursting solve in Gigabit Ethernet?",
      choices: [
        "It reduces the CRC computation time",
        "It lets several short frames be sent back to back so padding to 512 bytes is not wasted",
        "It allows half-duplex stations to transmit at full bandwidth without listening",
        "It removes the need for a preamble",
      ],
      answer: 1,
      why: "Because the half-duplex minimum frame is 512 bytes, short frames would otherwise need heavy padding. Frame bursting transmits a train of short frames in one acquired transmission, keeping the medium busy for the slot time while recovering efficiency.",
      sec: "s11",
    },
    {
      q: "Which statement about 10 Gigabit Ethernet is correct?",
      choices: [
        "It uses CSMA/CD with a 512-byte minimum frame",
        "It is full duplex only, so CSMA/CD is not used",
        "It uses Manchester encoding to reach 10 Gbps",
        "It changes the Ethernet frame format",
      ],
      answer: 1,
      why: "10 Gigabit Ethernet is defined for full-duplex point-to-point operation, so CSMA/CD is not used at all, and it retains the IEEE 802.3 frame format unchanged for backward compatibility.",
      sec: "s12",
    },
    {
      q: "Station A knows B's IP address but not its MAC address, and B is on the same LAN. What happens?",
      choices: [
        "A sends the data frame to the broadcast address immediately",
        "A sends an ARP request to the broadcast MAC address; B replies with its MAC address, which A caches",
        "A sends the data to the default gateway for forwarding",
        "A waits for B to announce itself with a gratuitous ARP",
      ],
      answer: 1,
      why: "ARP broadcasts a request for the owner of the unicast IP address; only B answers, replying with its MAC address. A caches the IP-to-MAC mapping so later frames go straight to B.",
      sec: "s13",
    },
    {
      q: "Which sequence correctly describes transparent bridging on a switch?",
      choices: [
        "Learn from the source address, forward on the destination address, flood if unknown, filter if source and destination share a port",
        "Learn from the destination address, forward on the source address, flood always",
        "Learn from the CRC, forward on the port number, never flood",
        "Learn from the IP address, forward on the MAC address, drop broadcasts",
      ],
      answer: 0,
      why: "A switch learns the arrival port of each frame's source address, forwards on the destination address, floods unknown destinations out all other ports, and filters frames whose source and destination share a port. Old entries are aged out.",
      sec: "s14",
    },
  ],
});
