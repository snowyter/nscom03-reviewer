window.NSCOM_MODULES = window.NSCOM_MODULES || [];
window.NSCOM_MODULES.push({
  id: "m01",
  num: 1,
  title: "Review of Physical and Data Link Layer",
  accent: "#e05a6f",
  icon: `<svg viewBox="0 0 32 32" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"><rect x="4" y="4" width="24" height="4.5" rx="1"/><rect x="4" y="11.5" width="24" height="4.5" rx="1"/><rect x="4" y="19" width="24" height="4.5" rx="1"/><path d="M4 29h24" stroke-width="1.2" stroke-dasharray="2 3" opacity=".6"/></svg>`,
  summary:
    "A review of the two lowest layers of the OSI Reference Model and of the Internet (TCP/IP) model built on top of them. This module covers the seven OSI layers and the job each performs, how the TCP/IP model's four layers map onto OSI's seven, the purpose of the data link layer — regulating and formatting transmission from software on a node to the network cabling facilities, framing, sequencing, flow control and error control — and the services it offers to the network layer above it. It then divides the data link layer into its LLC and MAC sublayers, surveys the types of networks that live at these layers (LAN, WAN, MAN and wireless) and their topologies, and finishes with the IEEE 802 project, the 802 series, and the analog-versus-digital question at the physical layer, including why analog transmission is still required when bandwidth is limited.",
  sections: [
    {
      id: "s1",
      title: "Why a Layered Model at All",
      body: [
        {
          type: "list",
          items: [
            "**Layer** = one slice of the problem, with a defined interface to its neighbours.",
            "**Protocol** = rules two *peer* layers use to talk; **service** = what a layer promises the one above it.",
            "Layering buys **interoperability**: swap Wi-Fi for fibre and the layers above never notice.",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "what each layer actually promises",
          body: [
            {
              type: "p",
              text: "Before any protocol can be described, you need a place to put it. A layered model is a way of slicing the enormous problem of moving data between two computers into smaller problems that can be solved independently. Each layer offers a service to the layer above it and consumes a service from the layer below it, and each layer speaks to its opposite number on the remote machine using its own protocol. The slide deck's closing joke — 'OSI Layer and maybe some lasagna' — makes the point that the model is literally a stack of horizontal slices.",
            },
            {
              type: "list",
              items: [
                "A layer is a self-contained piece of the communication problem with a defined interface to its neighbours.",
                "A protocol is the set of rules two peer layers use to talk to each other; protocol is vertical-independent, layer to layer.",
                "A service is what a layer promises the layer above it — expressed as primitives, never as implementation detail.",
                "An interface is where the promise is made — the boundary between adjacent layers on the same machine.",
                "Layering is what makes interoperability possible: replace the wireless physical layer with fibre and the network layer above it does not have to change.",
              ],
            },
            {
              type: "p",
              text: "As data descends the stack, each layer adds a header of control information to whatever it was handed, and the result is called a protocol data unit (PDU). The application layer creates a message; the transport layer wraps it into a segment; the network layer wraps that into a packet (datagram); the data link layer wraps that into a frame; and the physical layer has no PDU at all because it deals in individual bits. At the receiving end the process reverses exactly, with each layer stripping and interpreting its own header before handing the payload upward.",
            },
            {
              type: "table",
              head: ["OSI layer", "PDU name", "Address or identifier used"],
              rows: [
                ["Application", "Data / message", "User-visible name"],
                ["Presentation", "Data / message", "Encoding information"],
                ["Session", "Data / message", "Session identifier"],
                ["Transport", "Segment / datagram", "Port number"],
                ["Network", "Packet (datagram)", "Logical (IP) address"],
                ["Data link", "Frame", "Physical (MAC) address"],
                ["Physical", "Bit", "None — timing only"],
              ],
            },
            {
              type: "note",
              text: "Exam tip: when a question asks 'what is the PDU of layer N', naming the layer and the PDU together is the safest answer — for example 'layer 2, the data link layer, whose PDU is the frame'. Addresses are the second common question: MAC at layer 2, IP at layer 3, port at layer 4.",
            },
            {
              type: "example",
              text: "A user clicks a link in a web browser. Trace a single request down through the layers, naming the PDU produced at each step.",
              steps: [
                "The browser's HTTP request is application-layer data with a size of, say, 800 bytes.",
                "Layered on top of it, presentation and session handling add encoding and session state — the payload is still described as data.",
                "Transport wraps it in a TCP header, 20 bytes by default, producing a segment of 820 bytes.",
                "Network adds a 20-byte IP header, producing a packet of 840 bytes.",
                "Data link adds a 14-byte Ethernet header and a 4-byte trailer, producing a frame of 858 bytes.",
                "Physical serialises the 858 bytes as 6,864 bits and transmits them symbol by symbol.",
              ],
            },
          ],
        },
      ],
    },
    {
      id: "s2",
      title: "The Seven OSI Layers",
      body: [
        {
          type: "fig",
          fig: "m01-p02-osi-layer",
          caption: "Slide: the OSI Reference Model — seven layers stacked from the physical medium up to the user's application.",
        },
        {
          type: "list",
          items: [
            "Seven layers, top to bottom: **Application, Presentation, Session, Transport, Network, Data link, Physical**.",
            "Layers **1–3** are network support (move the bits). Layer **4** is the bridge. Layers **5–7** are user support.",
            "This module only cares about the bottom two — but you need the whole stack to know where the boundary is.",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "how to remember all seven",
          body: [
            {
              type: "p",
              text: "The OSI Reference Model organises communication into seven layers, numbered from the top down: application, presentation, session, transport, network, data link and physical. The model is not a protocol suite — it is a framework describing what each slice of the problem must accomplish. The slides for this module concentrate on the bottom two layers, but the review wants the whole stack in view so the boundaries of the data link layer are unambiguous.",
            },
            {
              type: "table",
              head: ["Layer", "Name", "Job", "Typical protocol"],
              rows: [
                ["7", "Application", "Network services directly usable by an application", "HTTP, FTP, SMTP, DNS"],
                ["6", "Presentation", "Data format, compression, encryption translation", "TLS, JPEG, ASCII/UTF-8"],
                ["5", "Session", "Dialog control, synchronisation, checkpoints", "RPC, sockets"],
                ["4", "Transport", "Process-to-process delivery, segmentation, end-to-end reliability", "TCP, UDP"],
                ["3", "Network", "Host-to-host delivery across an internetwork, routing, logical addressing", "IP, ICMP, ARP"],
                ["2", "Data link", "Node-to-node delivery, framing, MAC addressing, error and flow control", "Ethernet, Wi-Fi, PPP"],
                ["1", "Physical", "Bit transmission over the medium; cables, connectors, signalling", "RS-232, 1000BASE-T"],
              ],
            },
            {
              type: "list",
              items: [
                "Layers 1 to 3 are network support layers: they move bits, frames and packets through the network.",
                "Layer 4 is the transport layer and is the bridge between the two groups — it takes the entire message and breaks it into segments.",
                "Layers 5 to 7 are user support layers: they are not concerned with how the bits travel, only that the data reaches an application intact.",
                "Peer layers communicate by protocol; adjacent layers on the same machine communicate by service primitives.",
                "Layers 1 to 3 are usually implemented in hardware and operating-system drivers; layers 4 to 7 are usually user processes.",
              ],
            },
            {
              type: "p",
              text: "The grouping into network-support and user-support layers is the standard Forouzan framing and it forces a useful discipline when answering exam questions. If a question asks where an error is detected, you must first decide what kind of error. A bit flipped by a lightning strike on the wire is caught by the data link layer's checksum. A lost segment in a congested router is caught by TCP. A mistyped URL is caught by DNS. The word 'error' alone does not determine a layer; the scope of the error does.",
            },
            {
              type: "note",
              text: "Exam tip: the mnemonic for the layers from the top down is All People Seem To Need Data Processing. From the bottom up it is Physical Data Transmission Networked Seamlessly, Presenting Applications — either ordering is fine as long as you can place a given function on the right layer.",
            },
            {
              type: "example",
              text: "Place each function on the correct OSI layer: (a) decide which port the web server is listening on, (b) decide which cable pin carries the transmit pair, (c) decide which way a packet travels toward a remote network, (d) decide whether a frame arrived without bit errors from its immediate neighbour.",
              steps: [
                "(a) Transport layer — port numbers are layer 4 addresses identifying a process.",
                "(b) Physical layer — pin assignments and connector wiring are layer 1 mechanical and electrical specifications.",
                "(c) Network layer — routing and logical addressing are layer 3.",
                "(d) Data link layer — the frame check sequence guarding one hop is layer 2 error detection.",
              ],
            },
          ],
        },
      ],
    },
    {
      id: "s3",
      title: "The Internet (TCP/IP) Model and Its Mapping to OSI",
      body: [
        {
          type: "fig",
          fig: "m01-p03-internet-layer-vs-osi-layer",
          caption: "Slide: the Internet or TCP/IP model side by side with the OSI Reference Model, showing where layers collapse.",
        },
        {
          type: "list",
          items: [
            "The Internet model has **four** layers: application, transport, internet, link.",
            "It **collapses** OSI's top three into one, and OSI's bottom two into one.",
            "Collapsing is not cosmetic: TCP/IP treats everything below the internet layer as one hop-by-hop problem.",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "why the layers collapse",
          body: [
            {
              type: "p",
              text: "The OSI Reference Model was produced by ISO as a general architecture; the Internet model, also called the TCP/IP protocol suite, was produced by practice. The Internet model has fewer layers and unlike OSI its layers do not all correspond to simple hardware boundaries. The slide's diagram places the two side by side so the collapse is visible: OSI's application, presentation and session layers all become the Internet model's single application layer, and OSI's physical and data link layers both become the Internet model's link (network access) layer.",
            },
            {
              type: "table",
              head: ["OSI layer", "Internet model layer", "What happens"],
              rows: [
                ["7 Application", "Application", "HTTP, SMTP, DNS and any other application protocol"],
                ["6 Presentation", "Application", "Folded in — the application performs its own encoding"],
                ["5 Session", "Application", "Folded in — session state belongs to the application or to transport"],
                ["4 Transport", "Transport", "TCP and UDP: process-to-process delivery"],
                ["3 Network", "Internet", "IP: host-to-host delivery and routing — called the internet layer"],
                ["2 Data link", "Link (network access)", "Framing and medium access"],
                ["1 Physical", "Link (network access)", "Bit transmission: the link layer sits directly on the hardware"],
              ],
            },
            {
              type: "p",
              text: "The Internet model's link layer covers both OSI layers 1 and 2 because TCP/IP deliberately abstracted the hardware underneath. A TCP/IP stack was always designed to run over whatever link technology existed — Ethernet, a modem line, a satellite hop, a wireless cell — and the protocol suite says nothing about cables, voltages or connector pinouts. This is the design decision that made the Internet extensible: a new physical technology needs only a driver that presents the same link-layer interface to IP, and everything above it works unchanged. The same logic explains why the Internet model has no presentation or session layer: any encoding or dialog management that an application needs is built into that application's own protocol.",
            },
            {
              type: "list",
              items: [
                "The Internet model has four layers: application, transport, internet, link.",
                "Layer names matter: the Internet model calls layer 3 the internet layer, not the network layer, though the job is the same.",
                "OSI is a prescriptive reference; TCP/IP is a descriptive set of implemented protocols.",
                "Where a question says 'internet layer', it means OSI layer 3 functionality: logical addressing and routing.",
                "Where a question says 'network access' or 'link' in the Internet model context, it means OSI layers 1 and 2 together.",
              ],
            },
            {
              type: "note",
              text: "A common exam trap: the Internet model was not designed as a formal layer architecture and its exact layer count is sometimes given as five (application, transport, network, data link, physical) by textbooks that split the link layer. Both descriptions refer to the same protocol suite; what matters is that OSI's five upper-plus-three grouping does not reproduce it.",
            },
            {
              type: "example",
              text: "An engineer says 'our application does its own JSON serialisation and we do not need a session layer.' Explain which OSI layers are being merged and why the Internet model has no problem with this.",
              steps: [
                "JSON serialisation is a presentation-layer concern: defining a data representation both ends understand.",
                "The engineer's dialog is a session-layer concern: deciding who speaks when and how to resume.",
                "In the Internet model both live inside the application layer by definition.",
                "So the statement is entirely normal in TCP/IP terms — it is only a surprise if you insist the OSI seven-layer boundary is a hard requirement.",
              ],
            },
            {
              type: "example",
              text: "Which OSI layers does a Wi-Fi driver implement, and where does IP sit relative to it?",
              steps: [
                "The Wi-Fi driver covers the physical and the data link layers — radio modulation and framing plus medium access via CSMA/CA.",
                "Together these are the Internet model's link layer.",
                "IP sits directly above it, in the internet layer, and never inspects the radio details.",
                "That is the abstraction the link layer buys: IP sees a stream of frames, not a spread-spectrum carrier.",
              ],
            },
          ],
        },
      ],
    },
    {
      id: "s4",
      title: "Purpose of the Data Link Layer",
      body: [
        {
          type: "list",
          items: [
            "The data link layer **regulates and formats transmission** from software on a node to the network cabling.",
            "It works **node-to-node** (one hop), never end-to-end — that's the transport layer's job.",
            `"Error-free" here means *free of errors introduced in transit*, not *guaranteed delivery*.`,
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "what node-to-node really rules out",
          body: [
            {
              type: "p",
              text: "The purpose of the data link layer is to regulate and format transmission of data from software on a node to the network cabling facilities. In other words, it is the layer that translates an abstract message handed down by the network layer into a precisely formatted stream of bits that a particular physical medium will accept. It creates the network environment for the 'wire' and dictates data formats, timing, bit sequencing, and other activities for each particular type of network. Its headline promise is that it enables data frames to be transmitted error-free between two end nodes over the physical layer.",
            },
            {
              type: "list",
              items: [
                "Regulates and formats transmission of data from software on a node to the network cabling facilities.",
                "Creates the network environment for the 'wire' — the frame format, timing and bit sequencing rules specific to that network type.",
                "Enables data frames to be transmitted error-free between two end nodes over the physical layer.",
                "Is the boundary where the abstract becomes concrete: the network layer passes a packet, the link layer decides how that packet becomes electrical, optical or radio signals.",
              ],
            },
            {
              type: "p",
              text: "The phrase 'error-free' is usually read more strongly than intended. The data link layer's reliability is local: it guarantees, as far as its error detection allows, that a frame leaving node A is delivered to the adjacent node B intact. If the end-to-end path crosses five routers, then five separate link-layer conversations occur, and each one can detect and (optionally) correct its own local errors. That is why a corrupted frame on one hop does not have to be seen by the destination host — the receiving router's link layer discards it and, if the protocol supports it, requests a retransmission from the previous hop. End-to-end reliability across the whole path is the transport layer's job, not the link layer's.",
            },
            {
              type: "table",
              head: ["Concern", "Node-to-node (data link layer)", "End-to-end (transport layer)"],
              rows: [
                ["Addressing", "Physical/MAC address of the next hop", "Port number of a process"],
                ["Scope of reliability", "One hop", "Sender to final destination"],
                ["What is retransmitted", "A corrupted or lost frame", "A lost segment"],
                ["Typical protocol", "Ethernet, Wi-Fi, PPP", "TCP"],
                ["Detection method", "Frame check sequence (CRC)", "Checksum plus sequence numbers and acknowledgements"],
              ],
            },
            {
              type: "note",
              text: "Exam tip: whenever you see the phrase 'node-to-node' or 'hop-to-hop', the answer is the data link layer. 'Process-to-process' is the transport layer; 'host-to-host' is the network layer.",
            },
            {
              type: "p",
              text: "The 'network environment for the wire' phrase is worth unpacking because it captures the layer's real complexity. The same packet from the network layer must be carried over an Ethernet segment with a 1500-byte payload limit, then over a point-to-point fibre link with a 9,000-byte limit and no shared medium, then over a radio link with a completely different framing scheme. Each of those transitions is a change of link-layer environment, and the link layer at each end of a segment is responsible for choosing frame sizes, timing, bit ordering and access rules that suit exactly that medium. The network layer above it need not know any of this.",
            },
          ],
        },
      ],
    },
    {
      id: "s5",
      title: "Services of the Data Link Layer to Upper Layers",
      body: [
        {
          type: "fig",
          fig: "m01-p05-service-of-data-link-layer-to-upper",
          caption: "Slide: the services the data link layer provides to the layers above it — links, framing, sequencing, flow control, error detection and QoS.",
        },
        {
          type: "list",
          items: [
            "Six services to the layers above: **links, framing, sequencing, flow control, error control, QoS selection**.",
            "**Framing** = cutting the bit stream into recognisable boundaries. **Sequencing** = keeping the order intact.",
            "**Flow control** stops a fast sender drowning a slow receiver; **error control** catches what layer 1 garbles.",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "each service explained",
          body: [
            {
              type: "p",
              text: "The slides enumerate the data link layer's services to the layers above as a list: provisioning links between network entities, framing, frame sequencing, flow control, error detection and notification (and sometimes correction), and the selection of quality-of-service parameters. Each of these is a distinct promise, and an exam question can pick any one of them out and ask which layer makes it. Note in particular the wording on error handling: detection and notification come first, correction is explicitly optional.",
            },
            {
              type: "h3",
              text: "1. Provisioning links between network entities",
            },
            {
              type: "p",
              text: "The data link layer establishes the logical link between two network entities. The slides qualify this precisely: generally these are adjacent nodes within a subnetwork. That qualifier matters because it tells you the link is a single-hop connection, not a path across the whole internetwork. A subnetwork here means a set of nodes governed by one link-layer technology, such as a single Ethernet LAN or a single point-to-point circuit.",
            },
            {
              type: "h3",
              text: "2. Framing",
            },
            {
              type: "p",
              text: "Framing involves partitioning data into frames with recognized frame boundaries and exchanging these frames over the link. The physical layer delivers a continuous, undifferentiated stream of bits; nothing in the bit stream itself marks where one unit of data stops and the next begins. Framing imposes that structure, both by marking the boundaries and by attaching the control information — source and destination addresses, type, and error-checking field — that the frame needs.",
            },
            {
              type: "h3",
              text: "3. Frame sequencing",
            },
            {
              type: "p",
              text: "Frame sequencing involves maintaining the correct ordering of frames as they are being exchanged. On a single physical link the order of bits is preserved by nature, but a link-layer protocol can still reorder frames across retransmission: if frame 3 is corrupted and retransmitted, the receiver must know that the retried frame 3 belongs before frame 4 and not after it. Sequence numbers on frames give the receiver the information it needs to reorder or to detect a missing frame.",
            },
            {
              type: "h3",
              text: "4. Flow control",
            },
            {
              type: "p",
              text: "The data link layer establishes and maintains an acceptable level of flow control as frames are exchanged across a link. A fast transmitter can overwhelm a slower receiver's buffers, and once a buffer is full the receiver must simply drop whatever arrives, which wastes the bandwidth already spent on those frames. Flow control is the mechanism by which the receiver tells the transmitter to slow down or hold off — windowing or explicit readiness signalling, depending on the protocol.",
            },
            {
              type: "h3",
              text: "5. Error control",
            },
            {
              type: "p",
              text: "The data link layer detects errors in the physical layer, which includes error notification when errors are detected but not corrected, and it can also sometimes correct errors. The distinction is important and the slides state it explicitly: detection plus notification is mandatory, correction is a bonus that some protocols provide (for example by forward error correction or by retransmission) and others leave to higher layers.",
            },
            {
              type: "h3",
              text: "6. Quality-of-service selection",
            },
            {
              type: "p",
              text: "The data link layer can select QoS parameters associated with a specific transmission, including ensuring that sufficient bandwidth is available and that transmission delays are predictable and guaranteed. This is the service that makes latency-sensitive traffic possible at layer 2 — a voice-over-WLAN call needs the link layer itself to schedule its frames ahead of bulk file transfers.",
            },
            {
              type: "p",
              text: "Standard treatments add two further link-layer services that this slide list does not spell out. The first is addressing: because a frame must be delivered to the correct node on a shared medium, the data link layer carries the physical (MAC) address of the intended recipient. The second is access control, meaning the rules by which nodes sharing a medium take turns transmitting; without it two stations transmitting simultaneously on the same cable would destroy each other's frames. Both are delivered by the MAC sublayer described later in this module, and both are implicitly present in the phrase 'it creates the network environment for the wire'.",
            },
            {
              type: "table",
              head: ["Service", "Slide wording", "Why it is needed"],
              rows: [
                ["Link provisioning", "Provisioning links between network entities; generally adjacent nodes within a subnetwork", "Gives the network layer a defined point-to-point or shared link to send packets over"],
                ["Framing", "Partitioning data into frames with recognized frame boundaries", "The physical layer gives an undelimited bit stream; frames impose structure"],
                ["Frame sequencing", "Maintaining the correct ordering of frames", "Retransmission can deliver frames out of order, so the receiver needs ordering information"],
                ["Flow control", "Establishing and maintaining an acceptable level of flow control", "A fast sender can exhaust a slow receiver's buffers, and dropped frames waste bandwidth"],
                ["Error detection and notification", "Detecting errors in the physical layer, with notification but not correction", "The receiver must know when a frame is untrustworthy and must be told to discard or resend it"],
                ["Error correction", "Can also sometimes correct errors", "Some media or protocols repair a frame without a retransmission round trip"],
                ["QoS selection", "Ensuring sufficient bandwidth and predictable, guaranteed delays", "Real-time traffic needs bandwidth and delay guarantees, not best-effort delivery"],
              ],
            },
            {
              type: "example",
              text: "A file transfer over Wi-Fi slips badly whenever a video call starts. Explain which data link layer service the network is failing to provide and why the slide list includes it.",
              steps: [
                "The file transfer and the call are sharing the same wireless medium and the same access point.",
                "Without prioritisation, both get best-effort access and the call's small, delay-sensitive frames queue behind large file frames.",
                "The missing service is QoS selection: ensuring sufficient bandwidth is available and that transmission delays are predictable and guaranteed.",
                "It appears in the slide list precisely because the link layer — not the layers above — is where such a guarantee has to be made.",
              ],
            },
          ],
        },
      ],
    },
    {
      id: "s6",
      title: "The Data Link Layer's Two Sublayers: LLC and MAC",
      body: [
        {
          type: "list",
          items: [
            "The data link layer splits in two: **LLC** on top, **MAC** below.",
            "**LLC** handles framing, flow and error control, and talks to the network layer.",
            "**MAC** decides *who may transmit right now* — contention methods (ALOHA, CSMA) versus deterministic ones (token passing).",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "contention vs deterministic access",
          body: [
            {
              type: "p",
              text: "The slides treat media access control as a distinct topic under the heading 'Media Access Control or MAC Layer' and then treat the physical layer separately. That split reflects the standard division of the data link layer into two sublayers: the logical link control (LLC) sublayer above and the media access control (MAC) sublayer below. IEEE made this division explicit when it took over LAN standardisation, and every IEEE 802 LAN standard is written in two halves corresponding to the two sublayers. The slides for this module describe the MAC half directly and imply the LLC half through the service list.",
            },
            {
              type: "list",
              items: [
                "At the top of the data link layer, the logical link control sublayer handles framing, flow control, sequencing and error control.",
                "At the bottom, the media access control sublayer handles addressing and the rules for sharing the physical medium.",
                "Together they present a single data link layer to the network layer above them.",
                "The division exists because frame-delivery logic and medium-sharing logic are genuinely separable concerns — the first is the same for fibre and radio, the second is not.",
              ],
            },
            {
              type: "table",
              head: ["Sublayer", "Responsibility", "Protocols"],
              rows: [
                ["LLC (logical link control)", "Framing and error/fLow control, multiplexing of upper-layer protocols", "IEEE 802.2"],
                ["MAC (media access control)", "Shared-medium access rules, MAC addressing, frame delimiting on the wire", "802.3, 802.4, 802.5, 802.11"],
              ],
            },
            {
              type: "h3",
              text: "Media access control (MAC)",
            },
            {
              type: "p",
              text: "Media access control establishes a coordination between nodes in the network. This coordination allows a node to gain access to the media and transmit data. There are different types of media access control techniques, and the slides name two families: ALOHA style and token style. ALOHA-style access is contention-based and probabilistic — a station transmits when it has something to send and deals with collisions after the fact. Token-style access is deterministic and ordered — a station may transmit only when it holds a special frame called the token, so collisions cannot occur.",
            },
            {
              type: "list",
              items: [
                "ALOHA style — a station transmits as soon as it has data; frames can collide and must be retried. Pure ALOHA, slotted ALOHA and CSMA/CD are all members of this family.",
                "Token style — a token circulates in a fixed logical order; only the token holder transmits, so access is deterministic and bounded. Token Ring and Token Bus are members of this family.",
                "Contention-based schemes are simple and perform well under light load but degrade sharply as the medium becomes busy.",
                "Deterministic schemes are complex and have fixed overheads per token rotation, but they guarantee every station a turn within a bounded time — which is why they were favoured for industrial control.",
              ],
            },
            {
              type: "p",
              text: "The reason two families of access method exist at all is that they optimise for different objectives. Contention schemes such as CSMA/CD and CSMA/CA maximise throughput under bursty, light-to-moderate load, and they degrade gracefully rather than failing — but they cannot promise a maximum delay, because a station may lose an unbounded number of contention attempts in a row. Token schemes can promise a maximum delay, because the token returns to every station within one rotation time, whatever the offered load. That guarantee is what makes them attractive for factory-floor and avionics networks, where a late control message is as bad as a lost one. As shared-media LANs were replaced by switched Ethernet, contention overhead largely disappeared from the wired case, which is why deterministic LAN access is now a niche technology rather than the mainstream one.",
            },
            {
              type: "note",
              text: "Careful with names: the MAC sublayer and the MAC address are different things. The MAC sublayer is the lower half of the data link layer. The MAC address is the 48-bit hardware address that the MAC sublayer uses to identify a station on the medium. A question about 'the MAC address of the frame' is about addressing; a question about 'the MAC sublayer' is about medium access.",
            },
            {
              type: "example",
              text: "An office LAN uses Ethernet with CSMA/CD, and a factory control network uses a token-passing ring. Which one can guarantee a maximum frame delay, and why?",
              steps: [
                "The token ring can: a station's turn comes once per token rotation, and the rotation time is bounded by the number of stations and the maximum frame length.",
                "The Ethernet segment cannot: a station competing by CSMA/CD may lose the contention repeatedly, so its delay is not bounded.",
                "This is exactly the trade-off the slides hint at by listing ALOHA style and token style as separate techniques.",
                "It also explains why factory and avionics networks historically chose token rings despite the added complexity.",
              ],
            },
          ],
        },
      ],
    },
    {
      id: "s7",
      title: "Types of Networks in the Data Link Layer",
      body: [
        {
          type: "fig",
          fig: "m01-p06-type-of-networks-in-the-data-link-la",
          caption: "Slide: the three network types dealt with at the data link layer — LAN, WAN and wireless networks.",
        },
        {
          type: "list",
          items: [
            "Three environments the data link layer must handle: **LAN, MAN, WAN**.",
            "They differ by **span and ownership** — not by the protocols running on them.",
            "A LAN is one organisation's short-range network; a WAN crosses public ground you do not own.",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "LAN, MAN and WAN compared",
          body: [
            {
              type: "p",
              text: "The slides classify the networks the data link layer must handle into three types. A local area network is a connection of computers typically within 5 km. A wide area network covers geographically long distance connections. A wireless network uses unguided media and can be either short or long distance. The classification matters at this layer because each type imposes a different set of demands: a LAN can afford a shared medium and simple access rules, a WAN needs long-haul transport over long distances, and a wireless network must share the air and cope with a medium it cannot contain.",
            },
            {
              type: "list",
              items: [
                "Local Area Network (LAN) — computers typically within 5 km, normally adjacent to one another.",
                "Wide Area Network (WAN) — geographically long-distance connections.",
                "Wireless Network — unguided media connection, which can be short or long distance.",
                "The three are not mutually exclusive: a WAN can be built from wireless links, and a wireless network can serve a single room or a whole country.",
              ],
            },
            {
              type: "p",
              text: "Standard data-communications texts insert a fourth category between the LAN and the WAN: the metropolitan area network (MAN). A MAN is a high-speed network covering a city or a campus-sized region, typically owned by a single operator and used to connect many LANs together or to provide a city-wide service. Cable-television distribution networks and the classic IEEE 802.6 distributed queue dual bus (DQDB) network are the usual examples. The technical justification for the category is that a MAN spans distances at which the LAN's assumptions break down — propagation delay becomes comparable to frame transmission time — yet it is not a long-haul carrier network, so it needs its own design point. The slides' three-way list omits it, so treat the MAN as additive depth rather than as slide content.",
            },
            {
              type: "table",
              head: ["Type", "Typical span", "Ownership", "Example"],
              rows: [
                ["PAN (personal area network)", "A few metres", "Private", "Bluetooth headset and phone"],
                ["LAN (local area network)", "Up to about 5 km, normally one building or campus", "Private", "Ethernet office network"],
                ["MAN (metropolitan area network)", "A city or a large campus", "Private or single operator", "Cable-TV distribution, 802.6 DQDB"],
                ["WAN (wide area network)", "Country, continent or global", "Carriers and service providers", "Submarine fibre, satellite links, MPLS backbone"],
              ],
            },
            {
              type: "note",
              text: "Exam tip: the four categories are distinguished by span and ownership, not by protocol. A question describing a network spanning one campus block is a LAN; one spanning a city is a MAN; one spanning an ocean is a WAN. Wireless is a separate axis — it describes the medium, not the span.",
            },
            {
              type: "p",
              text: "Notice also that the classification is about the data link layer's environment rather than about any specific technology. The same Ethernet frame format appears in the LAN, and a fibre variant of it appears in MAN and WAN backbones; the same 802.11 frame format appears in a wireless LAN and, with different radio parameters, in wireless long-distance links. What changes across the categories is the ratio of propagation delay to transmission delay, the error profile of the medium, and who owns the infrastructure — and it is those differences that force different link-layer designs.",
            },
          ],
        },
      ],
    },
    {
      id: "s8",
      title: "Local Area Networks and LAN Topologies",
      body: [
        {
          type: "fig",
          fig: "m01-p07-local-area-network",
          caption: "Slide: a local area network — computers usually within 5 km, interconnected by copper or fibre and standardised by the IEEE 802 series.",
        },
        {
          type: "list",
          items: [
            "A **topology** is the geometric arrangement of links and nodes. The main ones: bus, ring, star, mesh.",
            "**Bus** = one shared backbone (cheap, one break kills the segment). **Star** = a central hub (easy to manage, hub is a single point of failure).",
            "Topologies belong at the data link layer because they decide who contends for the shared medium.",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "choosing between topologies",
          body: [
            {
              type: "p",
              text: "A local area network is typically confined to within 5 km, and normally the computers on it are adjacent to one another. Computers are interconnected using copper or fibre media. The slides state that a LAN typically uses the IEEE 802 series for LAN — which is exactly the point developed in the next section, since IEEE 802.3 was written as the standard for LAN technology. The short span and the private ownership together give the LAN its characteristic properties: its own administrator sets the addressing and configuration, and the raw propagation delay across the whole network is a small fraction of a millisecond.",
            },
            {
              type: "h3",
              text: "LAN topologies",
            },
            {
              type: "p",
              text: "A topology is the geometric arrangement of the links and nodes in a network, and it is a data link layer concern because the topology determines what medium-access rules are possible. Standard treatments distinguish two levels: the physical topology, which is how the cables actually run and where the devices physically sit, and the logical topology, which is the path a frame takes through the network. A network can have a star physical topology and a bus-like logical topology — a modern switched Ethernet LAN is exactly this case.",
            },
            {
              type: "list",
              items: [
                "Bus topology — one shared backbone cable with all stations tapping into it; a frame transmitted by one station is heard by every other station on the bus.",
                "Star topology — every station connects to a central device; the central device forwards frames, so a dedicated link connects each station.",
                "Ring topology — each station connects to exactly two neighbours, forming a closed loop; frames travel around the ring in one direction.",
                "Mesh topology — every station connects to every other; used where redundancy matters far more than cabling cost.",
                "Hybrid topology — a combination, such as a star of rings or a tree built from a hierarchy of stars, which is what most real installations are.",
              ],
            },
            {
              type: "table",
              head: ["Topology", "Cable cost", "Robustness to one link failure", "Access problem"],
              rows: [
                ["Bus", "Lowest — one backbone cable", "Poor: a break splits the whole network", "Sharing is implicit; every station hears every frame, so contention rules are needed"],
                ["Star", "Higher — one link per station", "Good: one link failure isolates one station", "Central device controls forwarding, so contention is managed centrally"],
                ["Ring", "One link per station, in a loop", "Moderate: a link break can be bypassed", "Ordered token passing gives deterministic access"],
                ["Mesh", "Highest — n(n−1)/2 links", "Best: many independent paths", "Usually point-to-point, so almost no sharing problem"],
              ],
            },
            {
              type: "p",
              text: "A bus and a ring differ physically, but the deeper difference is in what the data link layer has to do. On a bus every frame is heard by every station, so the access method must decide who is allowed to speak and how collisions are detected. On a ring a station physically cannot transmit to the ring until the frame it holds reaches it, which turns the access problem into a token discipline. On a star with a central switch each station has its own dedicated link and, in the modern switched case, full-duplex transmission with no contention at all. So the topology determines the access method, the access method determines the frame format's address fields and error handling, and everything else follows. That is the chain of reasoning the slides point at when they say the data link layer 'creates the network environment for the wire' for 'each particular type of network'.",
            },
            {
              type: "note",
              text: "A bus network's station count is limited in practice by attenuation and by the propagation delay of the shared cable: the further a station is from the far end, the longer a frame takes to reach it, and collision detection must complete within the frame's transmission time. This is the basis of the Ethernet 5-4-3 rule — at most five segments, four repeaters and three populated segments between any two stations.",
            },
            {
              type: "example",
              text: "A campus plans to connect 40 computers. Compare a bus and a star topology on the two criteria that usually decide the choice: fault tolerance and expandability.",
              steps: [
                "Fault tolerance: on a bus a single break in the backbone divides the network into two isolated halves, so one cable fault can take down everything beyond it.",
                "Fault tolerance: on a star a cable fault isolates exactly one workstation, because every station has its own link to the central device.",
                "Expandability: adding a station to a bus requires tapping the backbone at a suitable point and respecting the segment length limits.",
                "Expandability: adding a station to a star means running one cable to the central device and adding a port — which is why star cabling with a central switch became the standard LAN design.",
              ],
            },
          ],
        },
      ],
    },
    {
      id: "s9",
      title: "The IEEE 802 Project and the 802 Series",
      body: [
        {
          type: "fig",
          fig: "m01-p08-ieee-and-lan",
          caption: "Slide: IEEE assumed responsibility for LAN standards, primarily for the physical and data link layers, using the OSI Reference Model as a framework.",
        },
        {
          type: "fig",
          fig: "m01-p09-ieee-802-series",
          caption: "Slide: the IEEE 802 series — the working groups that produced the LAN and MAN standards.",
        },
        {
          type: "list",
          items: [
            "Before IEEE 802 there were no LAN standards — proprietary networks locked customers in.",
            "**802** standardised the LAN; **802.3 = Ethernet**, **802.11 = Wi-Fi**, **802.5 = Token Ring**.",
            "802.3 PHY names decode by position: **10BASE-T** = 10 Mbps, BASEband, Twisted pair.",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "decoding an 802.3 name",
          body: [
            {
              type: "p",
              text: "In the early days of networking there were no standards; organisations used proprietary networks and were locked into the vendor or the technology. Moving from one vendor's LAN to another meant replacing everything, and two organisations could not connect their networks at all unless both had bought from the same supplier. IEEE assumed responsibility for setting LAN standards, primarily for the physical and data link layers, using the OSI reference model as a framework. The project that carried this work is called IEEE 802, launched in February 1980 — which is where the number itself comes from: '80' for the year and '2' for February.",
            },
            {
              type: "list",
              items: [
                "Before IEEE 802, there were no LAN standards; vendors' proprietary networks locked customers into a single manufacturer.",
                "IEEE took responsibility for LAN standards, focused on the physical and data link layers.",
                "The OSI Reference Model was adopted as the framework, which is why the 802 standards split neatly into a MAC half and a physical half.",
                "The consequence for the buyer is interoperability: equipment from different vendors can share a medium because the frame format and medium-access rules are public.",
                "The consequence for the engineer is that link-layer behaviour is specified rather than discovered — the standard tells you frame layout, timing and access rules precisely.",
              ],
            },
            {
              type: "table",
              head: ["Standard", "Common name", "Scope", "Access method"],
              rows: [
                ["802.1", "Higher layer LAN protocols", "Bridging, VLANs, and the 802 layer management framework", "—"],
                ["802.2", "Logical link control", "The LLC sublayer common to all 802 LANs", "—"],
                ["802.3", "Ethernet", "CSMA/CD LAN; now the dominant wired LAN and MAN backbone technology", "CSMA/CD (contention)"],
                ["802.4", "Token Bus", "Token-passing access over a bus physical topology", "Token (deterministic)"],
                ["802.5", "Token Ring", "Token-passing access over a ring physical topology", "Token (deterministic)"],
                ["802.11", "Wireless LAN (Wi-Fi)", "Wireless local area networking over radio", "CSMA/CA (contention)"],
                ["802.15", "Wireless PAN (Bluetooth)", "Personal area networks over short-range radio", "Contention, master/slave polling"],
                ["802.16", "WiMAX", "Broadband wireless access over metropolitan distances", "Scheduling (base station controlled)"],
              ],
            },
            {
              type: "p",
              text: "Every IEEE 802 LAN standard is written in three parts that match the sublayer division described earlier. The LLC sublayer, standardised once as IEEE 802.2, sits above and is shared by all of them. Below it, each standard defines a MAC sublayer, such as 802.3's CSMA/CD or 802.11's CSMA/CA, and one or more physical-layer specifications. This is why a single network interface card can present an identical LLC interface to the operating system whether it is wired or wireless: the difference between Ethernet and Wi-Fi lives entirely in the MAC and physical halves. It is also why the same IP packet can be carried over either without IP knowing which is in use. Within 802.3 the physical specifications are named with a shorthand — 1000BASE-T means 1000 Mbps, baseband signalling, twisted-pair cable — so the name itself encodes the rate, the signalling scheme and the medium.",
            },
            {
              type: "list",
              items: [
                "The first number is the data rate in megabits per second; 10BASE-T is 10 Mbps, 1000BASE-T is 1000 Mbps.",
                "BASE means baseband transmission — the digital signal is placed on the medium directly.",
                "BROAD, where it appears, means broadband transmission, where the digital signal is modulated onto a carrier.",
                "The trailing letters identify the medium and encoding: T for twisted pair, F for fibre, X for a particular encoding scheme used with fibre and copper.",
                "So 1000BASE-T reads as 1000 Mbps, baseband, twisted pair — and 1000BASE-SX as 1000 Mbps, baseband, short-wavelength fibre with the X encoding.",
              ],
            },
            {
              type: "note",
              text: "The 802.4 Token Bus and 802.5 Token Ring standards are largely historical — real installations have all but disappeared as Ethernet and Wi-Fi displaced them. They remain examinable material precisely because they illustrate the deterministic access family, and because their decline is a useful example of how a technically sound standard can lose to a cheaper, easier-to-manage alternative.",
            },
            {
              type: "example",
              text: "A 802.3 physical-layer variant is named 100BASE-FX. Decode every part of the name and say whether it is baseband or broadband.",
              steps: [
                "100 — the data rate is 100 Mbps.",
                "BASE — baseband transmission: the digital signal is transmitted directly over the medium without modulation onto a carrier.",
                "F — the medium is fibre optic cable.",
                "X — a specific encoding scheme used with this rate over fibre (and its copper counterpart).",
                "So 100BASE-FX is 100 Mbps baseband signalling over fibre with the X encoding.",
              ],
            },
          ],
        },
      ],
    },
    {
      id: "s10",
      title: "Wide Area Networks",
      body: [
        {
          type: "fig",
          fig: "m01-p10-wide-area-network",
          caption: "Slide: a wide area network — submarine cable, satellite transmission and terrestrial microwave as the long-haul options.",
        },
        {
          type: "fig",
          fig: "m01-p11-spacex-starlink",
          caption: "Slide: SpaceX Starlink — a global satellite constellation at 550 km altitude, aimed at delivering high-speed broadband internet where access has been unreliable, expensive or unavailable.",
        },
        {
          type: "list",
          items: [
            "A WAN spans long distances — hundreds to thousands of kilometres.",
            "Options: **long-haul cable, leased lines, dark fibre, satellite**.",
            "For satellite, **altitude decides delay**: low orbit (Starlink) cuts round-trip latency by an order of magnitude versus GEO.",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "why orbit altitude sets the delay",
          body: [
            {
              type: "p",
              text: "A wide area network covers geographically long-distance connections. The slides describe the options plainly: a WAN can literally use a long cable to transmit data, and it normally uses fibre optic technology. The term dark fibre is used for unused fibre optic cable — fibre that has been laid but is not yet lit with transceivers, and which can therefore be leased to another party to light for itself. One example is submarine cable, or fibre cables laid down beside roads or commuter train railways. Microwave communications using satellite technology orbiting Earth and terrestrial microwave links complete the picture.",
            },
            {
              type: "list",
              items: [
                "A WAN can use a very long cable to transmit data — spans of hundreds or thousands of kilometres are normal.",
                "It normally uses fibre optic technology because fibre offers low attenuation and enormous bandwidth over those distances.",
                "Dark fibre is unused fibre optic cable — laid but not yet lit; it can be leased and activated by another operator.",
                "Submarine cable is the clearest example: fibre laid across ocean floors to carry intercontinental traffic.",
                "Fibre is also laid beside roads and along commuter railway corridors, where the right-of-way already exists and digging costs are lower.",
                "Microwave communications cover the wireless long-haul case, either via satellites in orbit around Earth or via terrestrial microwave links.",
              ],
            },
            {
              type: "p",
              text: "The slides cite SpaceX Starlink as a modern example of satellite-based WAN access. Its satellites are deployed globally at an altitude of 550 km above Earth, and the goal is to deliver high speed broadband internet to locations where access has been unreliable, expensive, or completely unavailable. The slide records that as of October 2020, SpaceX had launched 775 Starlink satellites. That altitude figure is technically significant: 550 km places Starlink in low Earth orbit rather than geostationary orbit, and low orbit is what makes the service usable for interactive traffic.",
            },
            {
              type: "p",
              text: "The reason satellite altitude dominates every discussion of satellite data service is propagation delay. Electromagnetic energy travels through free space at roughly 3 × 10⁸ m/s, so a one-way trip to a satellite and back costs about 2d/c seconds where d is the altitude. A geostationary satellite sits at approximately 35,786 km, giving a round trip of about 71,572 km, which is roughly 0.24 s — nearly a quarter of a second of pure delay before any equipment is considered. A Starlink satellite at 550 km gives a round trip of about 1,100 km, roughly 3.7 ms. Two orders of magnitude separate them, and that difference decides whether the link is usable for a voice call or an online game.",
            },
            {
              type: "formula",
              tex: "t_{prop} = \\frac{2d}{c} \\qquad c \\approx 3 \\times 10^{8}\\ \\text{m/s}",
              text: "The round-trip propagation time to a satellite equals twice the altitude divided by the speed of light in free space. Doubling accounts for the upward and downward legs of the trip.",
            },
            {
              type: "example",
              text: "Compute the one-way and round-trip propagation delay for a satellite at Starlink's 550 km altitude, and compare with a geostationary satellite at 35,786 km. Take c = 3 × 10⁸ m/s.",
              steps: [
                "Starlink one-way: t = d/c = 550,000 / (3 × 10⁸) = 1.833 × 10⁻³ s ≈ 1.83 ms.",
                "Starlink round trip: 2 × 1.83 ms ≈ 3.67 ms.",
                "Geostationary one-way: t = 35,786,000 / (3 × 10⁸) = 0.11929 s ≈ 119.3 ms.",
                "Geostationary round trip: 2 × 119.3 ms ≈ 238.6 ms.",
                "The low-orbit link is roughly 65 times faster in propagation terms, which is the whole engineering case for a low Earth orbit constellation.",
              ],
            },
            {
              type: "table",
              head: ["Long-haul option", "Typical capacity", "One-way delay character", "Notes"],
              rows: [
                ["Submarine fibre", "Terabits per second per cable system", "About 5 µs per km of fibre, so tens of milliseconds across an ocean", "Lowest delay and highest capacity; expensive to lay, cheap to operate"],
                ["Terrestrial microwave", "Hundreds of Mbps to Gbps per link", "About 3.3 µs per km, plus repeater processing", "Needs clear line of sight and tower spacing of tens of kilometres"],
                ["Geostationary satellite", "Tens to hundreds of Mbps per transponder", "About 119 ms one way regardless of ground distance", "Covers a third of the planet with one satellite, but the delay rules out interactive services"],
                ["Low Earth orbit satellite", "Hundreds of Mbps per user terminal", "About 1 to 4 ms one way at 550 km", "Needs a large constellation because each satellite passes overhead quickly"],
              ],
            },
            {
              type: "note",
              text: "Terminology check: dark fibre is not broken fibre. It is fibre that has been installed but has no active transmission equipment attached, so it carries no light and therefore no data. It is 'dark' in the sense of being unlit, and leasing it lets an operator control both ends of a link rather than buying a managed service.",
            },
          ],
        },
      ],
    },
    {
      id: "s11",
      title: "Wireless Networks",
      body: [
        {
          type: "fig",
          fig: "m01-p12-wireless-network",
          caption: "Slide: wireless networks use radio signals and microwave technology, and can serve as a PAN, a LAN or a WAN.",
        },
        {
          type: "list",
          items: [
            "Wireless uses **radio** (and microwave) instead of a guided medium — no cable at all.",
            "Wide-area wireless organises coverage into **cells**, which lets frequencies be **reused** across the area.",
            "Collision detection is much harder without a wire — hence **CSMA/CA** rather than CSMA/CD.",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "cells, reuse and why CA not CD",
          body: [
            {
              type: "p",
              text: "A wireless network uses radio signals for transmission and also uses microwave technology. The slides make the important structural point that it can be used as a personal area network, a local area network or a wide area network: wireless is a description of the medium, not of the span. It uses a 'cell' to interconnect mobile devices, and the slide's examples of wireless networks are Bluetooth, the IEEE 802.11 series wireless network, and the LTE mobile phone network. Those three examples map neatly onto the three spans — Bluetooth covers a few metres, 802.11 covers a building or campus, and LTE covers a metropolitan or regional area.",
            },
            {
              type: "list",
              items: [
                "Uses radio signals for transmission, and also uses microwave technology.",
                "Can be deployed as a personal area network, a local area network or a wide area network.",
                "Uses a 'cell' to interconnect mobile devices — a coverage area served by one base station or access point.",
                "Bluetooth — a short-range personal area network.",
                "IEEE 802.11 series wireless network — a wireless local area network, commonly called Wi-Fi.",
                "LTE mobile phone network — a wide-area cellular network.",
              ],
            },
            {
              type: "p",
              text: "The cell is the organising idea of every wide-area wireless network. A geographic area is divided into cells, each served by a base station, and the radio spectrum allocated to the operator is divided among groups of cells. Because radio power falls off with distance, the same frequencies can be reused by cells that are far enough apart that their coverage does not overlap meaningfully — a scheme called frequency reuse. This is what allows a mobile operator with a fixed slice of spectrum to serve a whole city: the spectrum is not duplicated, it is spatially partitioned. As a user moves from one cell to another, the network transfers the call or data session to the new base station in a process called handoff. Wireless LANs use a much simpler version of the same idea, with one access point serving one basic service area and a handoff occurring when a station associates with a different access point.",
            },
            {
              type: "table",
              head: ["Wireless example", "Scale", "Standard", "Access method"],
              rows: [
                ["Bluetooth", "Personal area network, about 10 m", "IEEE 802.15.1", "Master/slave polling in a piconet"],
                ["Wi-Fi", "Local area network, tens to hundreds of metres per access point", "IEEE 802.11", "CSMA/CA with optional RTS/CTS"],
                ["LTE", "Wide area cellular network, kilometres per base station", "3GPP LTE", "Base-station scheduling with frequency reuse across cells"],
              ],
            },
            {
              type: "p",
              text: "A wireless station cannot reliably detect a collision the way a wired station can. On a cable, transmitting and listening at the same time works because a collision produces a voltage change that the transmitter can observe directly. On radio, a station's own transmission drowns out anything else at its own receiver, so it cannot hear a second station colliding with it — the hidden station problem. IEEE 802.11 therefore uses collision avoidance rather than collision detection: a station listens before transmitting, waits a random backoff interval after the medium becomes idle, acknowledges every successfully received frame, and can optionally reserve the medium with request-to-send and clear-to-send control frames when hidden stations are suspected. This is the direct practical consequence of the medium being unguided and uncontainable, and it is why wireless link layers are considerably more elaborate than their wired counterparts.",
            },
            {
              type: "note",
              text: "Exam tip: 'wireless' tells you about the medium — unguided, using radio or microwave — not about the distance. A wireless network can therefore legitimately be called a PAN, a LAN or a WAN, which is exactly the point the slide is making.",
            },
          ],
        },
      ],
    },
    {
      id: "s12",
      title: "The Physical Layer at Layer 1",
      body: [
        {
          type: "list",
          items: [
            "The physical layer turns frames into **electrical, optical or electromagnetic signals** — and back.",
            "A PHY spec fixes four things: **mechanical, electrical, functional, procedural** characteristics.",
            "Media split into **guided** (copper, fibre) and **unguided** (radio, microwave, infrared).",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "the four PHY characteristics",
          body: [
            {
              type: "p",
              text: "The physical layer translates frames received from the data link layer (layer 2) into electrical, optical, or electromagnetic signals representing 0 and 1 values, or bits. It is the layer that actually touches the medium, and it is the only layer that does. Its specification includes the type of cable and connectors used, the electrical signals associated with each pin and connector, and the manner in which bit values are converted into physical signals. Everything else in this module sits on top of that conversion.",
            },
            {
              type: "list",
              items: [
                "Translates frames received from the data link layer into electrical, optical or electromagnetic signals representing 0 and 1 values.",
                "Specifies the type of cable and connectors used.",
                "Specifies the electrical signals associated with each pin and connector.",
                "Specifies the manner in which bit values are converted into physical signals.",
                "Serves both wired and wireless environments: the 'medium' can be copper, fibre or free space.",
              ],
            },
            {
              type: "p",
              text: "A physical-layer standard is normally described by four groups of characteristics. Mechanical characteristics fix the physical shape of the interface: connectors, pin counts, and cable dimensions. Electrical characteristics define the voltage levels, permitted data rate and distance limits for those voltages. Functional characteristics define what each circuit or pin actually does. Procedural characteristics define the sequence of events used to exchange data. The slide's sentence — cable and connector types, the electrical signals on each pin, and how bit values become physical signals — is these four groups restated in plain language.",
            },
            {
              type: "table",
              head: ["Characteristic", "What it fixes", "Example"],
              rows: [
                ["Mechanical", "Connector shape, pin layout, cable dimensions", "An RJ-45 jack with eight pins"],
                ["Electrical", "Voltage levels, data rate and distance limits", "0 V and +5 V representing binary 0 and 1"],
                ["Functional", "The role of each pin or circuit", "Which twisted pair carries the transmit signal"],
                ["Procedural", "The order of events for a transfer", "When the transmitter is permitted to begin sending bits"],
              ],
            },
            {
              type: "p",
              text: "Every physical layer sits on a medium, and media divide into two families. Guided media provide a physical path that the signal follows: twisted-pair copper, coaxial cable and optical fibre. Unguided media carry the signal through free space with no physical path: radio waves, microwaves and infrared. Guided media confine the signal and therefore give a predictable, low-noise channel, at the cost of having to be physically installed. Unguided media require no installation and reach mobile stations, but the signal is exposed to interference, must be regulated because the spectrum is a shared public resource, and is subject to attenuation that grows with distance far more sharply than in a cable.",
            },
            {
              type: "note",
              text: "Exam tip: the physical layer never inspects a frame, never checks a checksum and never decides who may transmit. It takes the bit stream it is given and reproduces that stream at the far end as faithfully as physics allows. If an exam question mentions cables, connectors, pin assignments, voltage levels or bit encoding, the answer is layer 1.",
            },
            {
              type: "example",
              text: "A network card specification lists an RJ-45 connector, a transmit differential pair on pins 1 and 2, a 1000 Mbps rate, and a Cat 6 cable requirement up to 100 m. Sort these into the four characteristic groups.",
              steps: [
                "RJ-45 connector — a mechanical characteristic: it fixes the physical shape of the interface.",
                "Transmit differential pair on pins 1 and 2 — a functional characteristic: it fixes what each circuit does.",
                "1000 Mbps rate and the 100 m limit — electrical characteristics: they define permitted voltage-related performance and distance.",
                "Cat 6 cable requirement — mechanical and electrical together: it is a cable type with specified electrical performance.",
                "Not stated but implied: the procedural rules for when a station may begin transmitting, which the MAC sublayer supplies.",
              ],
            },
          ],
        },
      ],
    },
    {
      id: "s13",
      title: "Signal Transmission: Analog and Digital",
      body: [
        {
          type: "fig",
          fig: "m01-p15-signal-transmission",
          caption: "Slide: transmission at the physical layer may use analog or digital signalling; analog varies strength, frequency or phase, digital codes the signal in binary.",
        },
        {
          type: "fig",
          fig: "m01-p16-signal-transmission",
          caption: "Slide: analog transmission and digital transmission compared as signalling methods.",
        },
        {
          type: "list",
          items: [
            "Two families of transmission: **analog** (continuous) and **digital** (discrete levels).",
            "Analog varies the **amplitude, frequency or phase** of a carrier; digital switches between discrete levels.",
            "They fail differently: analog degrades **gracefully**, digital fails **suddenly** at the noise margin.",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "why digital fails suddenly",
          body: [
            {
              type: "p",
              text: "Transmission in the physical layer can use analog or digital transmission. Analog communication refers to any method of communication based on analog principles where a signal can continuously vary in strength or quantity — for example, voltage in a circuit. Data are represented in analog form by varying the voltage of the wave, by varying the frequency, or by varying the phase of a wave. Digital communication refers to any method of communication based on digital principles where a signal is coded in binary form to represent 1 or 0. The slides give the concrete example that a binary 1 can be represented as +5 V and a binary 0 can be represented as 0 V.",
            },
            {
              type: "table",
              head: ["", "Analog transmission", "Digital transmission"],
              rows: [
                ["Signal character", "Continuously variable in strength or quantity", "Coded in binary form, representing 1 or 0"],
                ["How data are represented", "By varying voltage, frequency or phase of a wave", "By assigning levels to bit values, e.g. +5 V for 1 and 0 V for 0"],
                ["Number of states", "Infinitely many levels of intensity", "A limited number of defined values"],
                ["Typical physical layer use", "Modulated carriers over bandpass channels: radio, DSL, cable", "Baseband signalling over low-pass channels: LAN Ethernet, USB"],
                ["Susceptibility to noise", "Degrades gradually and can be restored by amplifiers", "Fails abruptly once noise exceeds the decision threshold"],
              ],
            },
            {
              type: "p",
              text: "The slide's list — vary the voltage, vary the frequency, or vary the phase — is the complete inventory of ways to impress information on a sine wave, because a sine wave has exactly three parameters. Amplitude (equivalently voltage), frequency and phase are independent of one another, so each can be varied to carry data. Varying them gives the three classical analog modulation schemes: amplitude modulation for voltage variation, frequency modulation for frequency variation, and phase modulation for phase variation. Every analog transmission technology, from broadcast radio to the most modern radio link, is built by varying one or more of these three parameters on a carrier.",
            },
            {
              type: "formula",
              tex: "s(t) = A(t) \\sin(2\\pi f(t)\\, t + \\phi(t))",
              text: "The transmitted wave at time t is an amplitude A, a frequency f and a phase phi, each of which may vary with time. Analog transmission works by letting one or more of A, f and phi carry the information; keeping all three constant carries nothing.",
            },
            {
              type: "p",
              text: "The practical difference between the two is how the signal fails. An analog signal carries its information in the exact value of a continuously varying quantity, so any noise added along the path is indistinguishable from signal and accumulates permanently. An amplifier placed along an analog link amplifies the accumulated noise as well as the signal, so the signal-to-noise ratio can never be improved once it has degraded. A digital signal carries its information in which of a small number of discrete levels the value is nearest, so the receiver's decision circuit only has to answer a multiple-choice question. Small amounts of noise do not change the answer, and a regenerator placed along a digital link recovers the exact original levels and therefore produces a mathematically clean signal with fresh noise margin. This is why long-haul links are digital even when the local subscriber loop is analog.",
            },
            {
              type: "example",
              text: "A binary code 1100 is transmitted with 1 represented by +5 V and 0 represented by 0 V. Sketch the levels and state how many discrete states the signal has. Then say what changes if the scheme instead represents data with four levels.",
              steps: [
                "The waveform is at +5 V for the first two bit intervals and at 0 V for the last two.",
                "The signal has exactly two defined levels in this scheme — a digital signal with L = 2.",
                "Each level carries log2 2 = 1 bit, so one bit corresponds to one symbol.",
                "With four levels the signal would have L = 4 discrete states, each carrying log2 4 = 2 bits.",
                "The waveform stays digital either way: 'digital' means a limited number of defined values, not necessarily two of them.",
              ],
            },
            {
              type: "note",
              text: "Do not confuse the number of levels with the analog/digital distinction. A digital signal with four levels is still digital — it has a limited number of defined values. A signal is analog when it can take infinitely many levels of intensity over a period of time, which is a statement about the set of values, not about how many are actually used.",
            },
          ],
        },
      ],
    },
    {
      id: "s14",
      title: "Why Use Analog Transmission?",
      body: [
        {
          type: "fig",
          fig: "m01-p17-why-use-analog-transmission",
          caption: "Slide: analog transmission is needed when bandwidth is limited; a modulator converts the digital signal to analog for the medium and a demodulator recovers it.",
        },
        {
          type: "list",
          items: [
            "Analog transmission is needed when **bandwidth is limited**.",
            "A baseband digital signal needs low frequencies; a bandpass channel (like a phone line, 300–3300 Hz) blocks them.",
            "**Modulating onto a carrier** shifts the signal into the band the channel will pass — and lets many signals share one medium.",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "the bandpass argument",
          body: [
            {
              type: "p",
              text: "Analog transmission is needed when bandwidth is limited. Limited bandwidth in a medium does not allow a digital signal to pass through, so digital signals are modulated into analog signals and then transmitted over the medium. The slide's diagram shows the arrangement explicitly: a modulator on the sending side, a demodulator on the receiving side, and modulators and demodulators again at the far end for the return direction. The reasons the digital baseband signal cannot simply be sent are twofold: a channel that does not include zero frequency cannot pass the low-frequency content a baseband square-ish waveform needs to hold its shape, and a shared medium has to be divided among many users, which is only possible if each user occupies a band of frequencies rather than the whole span.",
            },
            {
              type: "list",
              items: [
                "Analog transmission is needed when bandwidth is limited.",
                "Limited bandwidth in a medium does not allow a digital signal to pass through.",
                "Digital signals are therefore modulated into analog signals and then transmitted over the medium.",
                "The sending end uses a modulator; the receiving end uses a demodulator; both appear at each end for a bidirectional link.",
                "A modem is exactly this pair: a modulator and a demodulator in one unit.",
              ],
            },
            {
              type: "p",
              text: "A baseband digital signal is, in the frequency domain, a composite of a low-frequency fundamental and many harmonics. Its energy extends from zero frequency upward, and it is the low-frequency components that give the waveform its flat tops. A bandpass channel — a telephone line carrying voice from 300 Hz to 3300 Hz, or a radio channel centred on a carrier — simply does not pass energy below its lower cutoff. If the digital signal were applied directly, the low-frequency content would be lost and the waveform would arrive so deformed that the receiver could not decide the bit values. Modulation solves this by translating the digital signal's spectrum up to sit around a carrier frequency that lies inside the channel's passband. The shape of the digital data is then preserved in the modulation's variations, and the receiver's demodulator recovers it.",
            },
            {
              type: "formula",
              tex: "\\text{Modulated signal} = \\text{carrier} \\times \\text{data, i.e. } A\\sin(2\\pi f_c t + \\phi) \\text{ with } A, f_c \\text{ or } \\phi \\text{ made to follow the data}",
              text: "Modulation multiplies a high-frequency carrier by the data, so the data's frequency content is shifted up to sit around the carrier frequency. The data ride in whichever carrier parameter is varied — amplitude, frequency or phase.",
            },
            {
              type: "p",
              text: "Beyond the bandpass problem, modulation is what makes a physical medium shareable. If each subscriber's data are modulated onto a different carrier frequency, many independent channels can travel over the same cable or through the same radio spectrum without interfering, as long as their frequency bands do not overlap. This technique is frequency-division multiplexing, and it is the basis of cable television distribution, of the multiple channels a cellular operator puts into its licensed spectrum, and of the way a Wi-Fi access point and a nearby one can operate simultaneously on different channels. A baseband scheme, by contrast, consumes the entire bandwidth of the medium for a single signal — which is why baseband is a dedicated-medium technology and broadband is a shared-medium one.",
            },
            {
              type: "table",
              head: ["", "Baseband signalling", "Broadband (modulated) signalling"],
              rows: [
                ["Signal placed on the medium", "The digital signal as generated", "An analog carrier whose amplitude, frequency or phase follows the data"],
                ["Channel type required", "Low-pass, must extend down to 0 Hz", "Bandpass, centred on a carrier inside the channel's passband"],
                ["Equipment at each end", "Line driver and receiver only", "Modulator and demodulator (a modem)"],
                ["Medium sharing", "Whole medium per signal — dedicated", "Many carriers can coexist on one medium — frequency-division multiplexing"],
                ["Typical example", "1000BASE-T Ethernet on Cat 6, USB", "DSL over the telephone loop, cable modems, Wi-Fi, broadcast radio"],
              ],
            },
            {
              type: "example",
              text: "A telephone subscriber loop passes only 300 Hz to 3300 Hz. Explain why an ordinary baseband serial signal cannot be sent down it and how the answer changes with a modem.",
              steps: [
                "The channel is bandpass: it does not pass frequencies below 300 Hz, and its total bandwidth is only 3000 Hz.",
                "An ordinary baseband digital signal has its energy concentrated at and near zero frequency, which falls entirely below the channel's lower cutoff.",
                "Applied directly, that signal would be so attenuated and deformed as to be unrecoverable — limited bandwidth does not allow the digital signal to pass through.",
                "A modem modulates the digital data onto a carrier inside the 300 to 3300 Hz passband, so the data's spectrum is shifted up into the region the line does pass.",
                "At the far end the demodulator recovers the bit stream — which is exactly the modulator/demodulator pair the slide's diagram shows.",
              ],
            },
            {
              type: "note",
              text: "Exam tip: the chain of reasoning to reproduce is short and should be memorised. Limited bandwidth forbids baseband; a bandpass channel cannot carry low-frequency content; therefore the digital signal is modulated onto a carrier inside the passband; therefore the medium can pass it, and several carriers can share the medium. Every question in this area is a variation on that chain.",
            },
          ],
        },
      ],
    },
    {
      id: "s15",
      title: "Putting the Two Layers Together",
      body: [
        {
          type: "list",
          items: [
            "Every fact in this module belongs to **layer 1 or layer 2** — ask which, and you have answered most exam questions.",
            "**Layer 2** owns framing, addressing, flow and error control between nodes. **Layer 1** owns the signal on the medium.",
            "The two are inseparable in practice: a frame is meaningless without a signal to carry it.",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "which layer does what",
          body: [
            {
              type: "p",
              text: "The module is a review, so its value is in the connections between the pieces. The data link layer takes a packet from the network layer and turns it into frames with boundaries, addresses, sequence numbers and an error check; it then applies whatever medium-access rules the network type demands. It hands each frame down to the physical layer, which converts the bits into electrical, optical or electromagnetic signals and puts them on the medium. At the far end the physical layer recovers bits, the data link layer reassembles them into a frame, verifies the check, and passes the payload up. Every specific technology in this module — Ethernet, Token Ring, Wi-Fi, LTE, fibre, satellite — is a concrete set of choices at exactly those two layers.",
            },
            {
              type: "h3",
              text: "Where each topic in this module lives",
            },
            {
              type: "table",
              head: ["Topic", "Layer or sublayer", "Why it belongs there"],
              rows: [
                ["OSI seven-layer model", "Framework", "Defines the boundary of every layer, including the two being reviewed"],
                ["Internet model and its mapping", "Framework", "Shows that OSI's layers 1 and 2 together are the Internet model's single link layer"],
                ["Purpose: regulate and format transmission to the cabling facilities", "Data link layer", "It is the layer that converts network-layer packets into medium-ready frames"],
                ["Link provisioning, framing, sequencing, flow control, error control, QoS", "Data link layer (LLC)", "These are services offered upward, so they sit in the upper sublayer"],
                ["Media access control", "Data link layer (MAC)", "Deciding who may transmit on a shared medium is a layer 2 function"],
                ["Types of networks: LAN, WAN, wireless", "Data link layer environment", "Each type imposes its own framing, timing and access rules"],
                ["IEEE 802 project and series", "Physical and data link layers", "IEEE standardised LANs primarily at these two layers"],
                ["Analog versus digital transmission", "Physical layer", "It is the signalling decision made when bits become energy"],
                ["Modulation for limited bandwidth", "Physical layer", "It is how bits are conveyed over a bandpass channel"],
              ],
            },
            {
              type: "note",
              text: "Exam tip: for any fact in this module, ask which of the two layers it belongs to. If the fact is about frames, addresses, ordering, error checks or who may transmit, it is layer 2. If it is about cables, connectors, voltages, signalling or modulation, it is layer 1.",
            },
            {
              type: "example",
              text: "A wireless laptop sends a frame to an access point, which forwards it onto an Ethernet cable toward a router. Identify which layer-2 environments the frame passes through and what changes at each boundary.",
              steps: [
                "First environment: the 802.11 wireless LAN. The frame uses 802.11 framing, MAC addresses and CSMA/CA medium access, and it is carried over radio at the physical layer.",
                "At the access point the 802.11 frame is received, checked, and its payload extracted — the access point is the endpoint of that layer-2 conversation.",
                "Second environment: the 802.3 Ethernet segment. A new frame is built with Ethernet framing and Ethernet MAC addresses, carried over copper at the physical layer.",
                "What stays constant across the boundary: the IP packet inside, whose addressing is a layer-3 concern and is untouched by either link layer.",
                "What changes: the frame format, the MAC addresses, the maximum frame size and the medium-access rules — all of which are link-layer, not network-layer, matters.",
              ],
            },
            {
              type: "p",
              text: "This example is the clearest possible demonstration of the data link layer's scope. The frame that leaves the laptop is not the frame that crosses the Ethernet cable, yet the packet the user sent is unchanged end to end. The laptop's link layer and the access point's link layer had a conversation, and the access point's link layer then had a completely different conversation with the router. Reliability, addressing and framing are all per-hop; only the network layer and above have an end-to-end view. That single observation is worth more in an exam than any individual definition in this module.",
            },
          ],
        },
      ],
    },
  ],
  flashcards: [
    { q: "What is a protocol data unit, and name the PDU at each OSI layer?",
      a: "A PDU is the unit of data a layer produces after adding its own control header. Message/data at layers 7-5, segment at layer 4, packet or datagram at layer 3, frame at layer 2, and just bits at layer 1 — which has no PDU of its own.", sec: "s1" },
    { q: "Name the seven OSI layers from top to bottom.",
      a: "Application, presentation, session, transport, network, data link and physical. Layers 1-3 are network support layers, layer 4 is the transport layer, and layers 5-7 are user support layers.", sec: "s2" },
    { q: "What address is used at each of OSI layers 2, 3 and 4?",
      a: "Layer 2 uses the physical or MAC address, layer 3 uses the logical (IP) address, and layer 4 uses the port number that identifies a process.", sec: "s2" },
    { q: "How does the Internet (TCP/IP) model map onto OSI?",
      a: "Its application layer covers OSI's application, presentation and session layers; its transport layer is OSI's transport layer; its internet layer is OSI's network layer; and its link (network access) layer covers both OSI's data link and physical layers.", sec: "s3" },
    { q: "Why does the Internet model have no presentation or session layer?",
      a: "Because it was built from practice rather than from an architecture: any encoding or dialog management an application needs is built into that application's own protocol, so no separate layers were defined for those jobs.", sec: "s3" },
    { q: "State the slide definition of the data link layer's purpose.",
      a: "To regulate and format transmission of data from software on a node to the network cabling facilities — creating the network environment for the wire, dictating data formats, timing and bit sequencing for each particular type of network, and enabling data frames to be transmitted error-free between two end nodes over the physical layer.", sec: "s4" },
    { q: "Does the data link layer's reliability extend end to end?",
      a: "No. Its reliability is local — node to node, one hop at a time. Each hop in a multi-router path has its own link-layer conversation. End-to-end reliability across the whole path is the transport layer's job.", sec: "s4" },
    { q: "List the six services the data link layer provides to upper layers.",
      a: "Provisioning links between network entities (usually adjacent nodes within a subnetwork); framing; frame sequencing; flow control; error detection with notification, and sometimes correction; and selection of QoS parameters including sufficient bandwidth and predictable, guaranteed delays.", sec: "s5" },
    { q: "What does the slide say about error correction at the data link layer?",
      a: "Detection and notification are what the layer provides — it detects errors in the physical layer and notifies when they are found. Correction is not guaranteed: the layer can also sometimes correct errors, but that is optional.", sec: "s5" },
    { q: "What is frame sequencing and why is it needed?",
      a: "It means maintaining the correct ordering of frames as they are exchanged. It is needed because a retransmitted frame can arrive out of order, so the receiver needs sequence information to reorder frames or detect a missing one.", sec: "s5" },
    { q: "Into which two sublayers is the data link layer divided, and what does each do?",
      a: "The logical link control (LLC) sublayer on top handles framing, flow control, sequencing and error control. The media access control (MAC) sublayer below handles addressing and the rules for sharing the physical medium.", sec: "s6" },
    { q: "What does media access control do, and name the two style families.",
      a: "It establishes coordination between nodes so that a node can gain access to the media and transmit data. The slides name two families: ALOHA style, which is contention based, and token style, which is deterministic and ordered.", sec: "s6" },
    { q: "Name the three types of networks the slides list at the data link layer, with their spans.",
      a: "Local area network — computers typically within 5 km. Wide area network — geographically long-distance connections. Wireless network — unguided media, which can be either short or long distance.", sec: "s7" },
    { q: "What is a metropolitan area network and why is it a separate category?",
      a: "A MAN is a high-speed network spanning a city or large campus, typically owned by a single operator and used to link many LANs. It is separate because it occupies a span where propagation delay becomes comparable to frame transmission time, so the LAN's design assumptions break down, yet it is not a long-haul carrier network.", sec: "s7" },
    { q: "Describe a bus, a star and a ring topology.",
      a: "A bus has one shared backbone that every station taps and hears. A star connects every station to a central device over a dedicated link. A ring connects each station to exactly two neighbours in a closed loop, with frames travelling in one direction.", sec: "s8" },
    { q: "Why is topology a data link layer topic rather than a physical layer topic?",
      a: "Because the topology determines the access method, and the access method is a MAC sublayer concern. A bus forces contention rules because every station hears every frame; a ring enables ordered token passing; a star with a central switch removes contention altogether.", sec: "s8" },
    { q: "Why did IEEE take over LAN standardisation?",
      a: "Because in the early days of networking there were no standards: organisations used proprietary networks and were locked into a vendor or technology. IEEE assumed responsibility for setting LAN standards, primarily for the physical and data link layers, using the OSI reference model as a framework.", sec: "s9" },
    { q: "What is IEEE 802.3, and what access method does it use?",
      a: "IEEE 802.3 is Ethernet — the dominant wired LAN standard. It uses CSMA/CD, a contention-based (ALOHA style) medium access method. Its physical-layer variants are named in the form rate-BASE-medium, such as 1000BASE-T.", sec: "s9" },
    { q: "Which IEEE 802 standards use token access, and what are they called?",
      a: "IEEE 802.4 is Token Bus (token passing over a bus physical topology) and IEEE 802.5 is Token Ring (token passing over a ring). Both are deterministic, guaranteeing each station a bounded turn.", sec: "s9" },
    { q: "Decode the name 1000BASE-T.",
      a: "1000 means 1000 Mbps, BASE means baseband transmission (the digital signal is placed on the medium directly), and T means twisted-pair cable. So it is 1 Gbps baseband signalling over twisted pair.", sec: "s9" },
    { q: "What is dark fibre?",
      a: "Unused fibre optic cable — fibre that has been laid but is not lit with active transmission equipment, and which can therefore be leased for another party to activate itself.", sec: "s10" },
    { q: "How high are Starlink satellites, and why does that altitude matter?",
      a: "Starlink deploys at 550 km above Earth. The low altitude keeps propagation delay small — roughly 1.83 ms one way and 3.67 ms round trip — compared with about 119 ms one way for a geostationary satellite at 35,786 km, so the link is usable for interactive traffic.", sec: "s10" },
    { q: "Compute the one-way propagation delay to a geostationary satellite at 35,786 km, with c = 3 × 10⁸ m/s.",
      a: "t = d/c = 35,786,000 / (3 × 10⁸) = 0.11929 s ≈ 119.3 ms one way, giving about 238.6 ms round trip — which is why geostationary links suit broadcast but not voice.", sec: "s10" },
    { q: "What is a cell in a wireless network?",
      a: "A coverage area served by one base station or access point. A wide-area wireless network divides its territory into cells and reuses the same frequencies in cells far enough apart not to interfere, which is how a fixed slice of spectrum serves a whole city.", sec: "s11" },
    { q: "Give the three wireless network examples from the slides and their scale.",
      a: "Bluetooth — a personal area network over about 10 m. IEEE 802.11 series wireless network (Wi-Fi) — a local area network. LTE mobile phone network — a wide-area cellular network.", sec: "s11" },
    { q: "What does the physical layer do with the frames it receives from layer 2?",
      a: "It translates frames received from the data link layer into electrical, optical, or electromagnetic signals representing 0 and 1 values, or bits. Its specification includes the cable and connector types, the electrical signals on each pin, and how bit values become physical signals.", sec: "s12" },
    { q: "Name the four characteristics of a physical-layer specification.",
      a: "Mechanical (connector shape, pin layout, cable dimensions), electrical (voltage levels, data rate and distance limits), functional (what each pin or circuit does) and procedural (the sequence of events for a transfer).", sec: "s12" },
    { q: "What is the difference between guided and unguided media?",
      a: "Guided media provide a physical path the signal follows — twisted pair, coaxial cable, optical fibre. Unguided media carry the signal through free space with no physical path — radio, microwave and infrared.", sec: "s12" },
    { q: "Define analog and digital communication as the slides state them.",
      a: "Analog communication is any method based on analog principles where a signal can continuously vary in strength or quantity, for example voltage in a circuit; data are represented by varying voltage, frequency or phase. Digital communication is any method where a signal is coded in binary form to represent 1 or 0 — for example +5 V for binary 1 and 0 V for binary 0.", sec: "s13" },
    { q: "In how many ways can data be represented on an analog wave?",
      a: "Three, matching the three parameters of a sine wave: by varying the voltage (amplitude), by varying the frequency, or by varying the phase of the wave.", sec: "s13" },
    { q: "Why does a digital signal survive noise better than an analog one?",
      a: "A digital signal carries its information in which of a small number of discrete levels the value is nearest, so the receiver only has to decide between a few states and small noise does not change the answer. Analog information sits in the exact value of a continuously varying quantity, so added noise is permanent and cannot be removed by amplifying the signal.", sec: "s13" },
    { q: "Why is analog transmission needed when bandwidth is limited?",
      a: "Limited bandwidth in a medium does not allow a digital signal to pass through — a bandpass channel does not pass the low-frequency content a baseband digital waveform needs to hold its shape. So the digital signal is modulated into an analog signal and then transmitted over the medium.", sec: "s14" },
    { q: "What equipment appears at each end of a link that uses analog transmission for digital data?",
      a: "A modulator at the sending end and a demodulator at the receiving end, repeated at both ends for a bidirectional link. The pair is called a modem — modulator and demodulator in one unit.", sec: "s14" },
    { q: "Besides passing a bandpass channel, what second benefit does modulation give?",
      a: "Spectrum sharing. Modulating each user's data onto a different carrier lets many independent channels travel over the same cable or the same radio spectrum without interfering, which is frequency-division multiplexing — the basis of cable TV, cellular channels and Wi-Fi channels.", sec: "s14" },
    { q: "Which layer-2 environments does a frame cross between a laptop and a router, and what changes?",
      a: "It crosses an 802.11 wireless LAN and then an 802.3 Ethernet segment. The frame format, MAC addresses, maximum frame size and access rules all change at the access point, while the IP packet inside is untouched because addressing at layer 3 is an end-to-end concern.", sec: "s15" },
  ],
  quiz: [
    { q: "What is the PDU of the data link layer?",
      choices: ["Packet", "Segment", "Frame", "Bit"],
      answer: 2,
      why: "Each layer names its protocol data unit. The data link layer produces a frame, the network layer produces a packet, the transport layer produces a segment, and the physical layer deals only in bits.", sec: "s1" },
    { q: "Which OSI layers does the Internet (TCP/IP) model's link layer correspond to?",
      choices: ["The network layer only", "The data link and physical layers", "The data link layer only", "The transport and network layers"],
      answer: 1,
      why: "In the Internet model the link (network access) layer covers both OSI's data link layer and OSI's physical layer, which is why TCP/IP is described with fewer layers than OSI's seven.", sec: "s3" },
    { q: "Which grouping of OSI layers does the Internet model fold into its single application layer?",
      choices: ["Application, presentation and session", "Transport, network and data link", "Session, transport and network", "Presentation, session and transport"],
      answer: 0,
      why: "OSI's application, presentation and session layers all become the Internet model's application layer. Transport and network remain as separate layers, and the link layer absorbs OSI layers 1 and 2.", sec: "s3" },
    { q: "According to the slides, what is the purpose of the data link layer?",
      choices: ["To route packets between independent networks using logical addresses", "To regulate and format transmission of data from software on a node to the network cabling facilities", "To provide end-to-end process-to-process delivery with retransmission", "To convert bits into electrical, optical or electromagnetic signals"],
      answer: 1,
      why: "The slide states the purpose as regulating and formatting transmission of data from software on a node to the network cabling facilities, creating the network environment for the wire and dictating formats, timing and bit sequencing. Signal conversion is the physical layer's job.", sec: "s4" },
    { q: "The data link layer enables data frames to be transmitted error-free between which two points?",
      choices: ["Two processes on the same host", "Two end nodes, over the physical layer", "Two applications on separate continents", "Two subnets using different routing protocols"],
      answer: 1,
      why: "The slide wording is that it enables data frames to be transmitted error-free between two end nodes over the physical layer. Its scope is node to node, which means local, per-hop reliability rather than end-to-end process delivery.", sec: "s4" },
    { q: "Which of these is NOT one of the services the slides list the data link layer as providing to upper layers?",
      choices: ["Framing — partitioning data into frames with recognized boundaries", "Frame sequencing — maintaining the correct ordering of frames", "Flow control as frames are exchanged across a link", "Routing frames between autonomous systems using logical addresses"],
      answer: 3,
      why: "Routing between autonomous systems is a network-layer function. The slide list covers link provisioning, framing, frame sequencing, flow control, error detection with notification (and sometimes correction), and QoS parameter selection.", sec: "s5" },
    { q: "What does the slides' wording say about error handling at the data link layer?",
      choices: ["It always corrects every error it detects", "It detects errors and notifies, and can sometimes correct them", "It detects errors but never notifies the sender", "It performs no error handling at all; that is layer 4's job"],
      answer: 1,
      why: "The slide says the layer detects errors in the physical layer, including error notification when errors are detected but not corrected, and that it can also sometimes correct errors. Correction is optional, detection and notification are not.", sec: "s5" },
    { q: "Frame sequencing at the data link layer involves:",
      choices: ["Converting bits into electrical or optical signals in the correct order", "Maintaining the correct ordering of frames as they are exchanged", "Assigning QoS parameters to each frame", "Encrypting frames so their contents cannot be reordered"],
      answer: 1,
      why: "The slide defines frame sequencing as maintaining the correct ordering of frames as they are being exchanged across the link. Retransmission is what makes the ordering question real, since a retried frame can arrive after a later one.", sec: "s5" },
    { q: "Which two sublayers make up the data link layer?",
      choices: ["Transport and network", "Logical link control and media access control", "MAC and physical", "Session and presentation"],
      answer: 1,
      why: "The data link layer divides into logical link control (LLC) above, which handles framing, flow control, sequencing and error control, and media access control (MAC) below, which handles addressing and shared-medium access rules.", sec: "s6" },
    { q: "What does media access control do?",
      choices: ["Establishes coordination between nodes so that a node can gain access to the media and transmit data", "Converts frames into electromagnetic signals for the medium", "Selects the best route for a frame across the internetwork", "Compresses frame payloads before transmission"],
      answer: 0,
      why: "The slide defines media access control as establishing coordination between nodes in the network so that a node can gain access to the media and transmit data. The slides name ALOHA style and token style as the two families of techniques.", sec: "s6" },
    { q: "Which pair correctly names the two families of media access control techniques given in the slides?",
      choices: ["ALOHA style and token style", "Synchronous and asynchronous", "Baseband and broadband", "Analog and digital"],
      answer: 0,
      why: "The slide lists ALOHA style and token style. ALOHA style is contention based, so frames can collide and must be retried; token style is ordered and deterministic because only the token holder may transmit.", sec: "s6" },
    { q: "According to the slides, a local area network is defined by which distance figure?",
      choices: ["Within 100 m", "Typically within 5 km", "Within 50 km", "Within 500 km"],
      answer: 1,
      why: "The slides describe a LAN as a connection of computers typically within 5 km, with the computers normally adjacent to one another and interconnected using copper or fibre media. MAN and WAN spans are larger.", sec: "s7" },
    { q: "Which of the following is a wide area network technology named in the slides?",
      choices: ["Submarine fibre optic cable", "A star-wired Ethernet LAN", "Bluetooth piconet", "IEEE 802.3 CSMA/CD segment"],
      answer: 0,
      why: "The slides name submarine cable and fibre cables laid beside roads or railway as WAN examples, along with satellite and terrestrial microwave links. Ethernet, Bluetooth and CSMA/CD are LAN or PAN technologies.", sec: "s10" },
    { q: "What does the term dark fibre mean?",
      choices: ["Fibre optic cable that has been physically damaged", "Unused fibre optic cable that has been laid but is not lit", "Fibre optic cable carrying encrypted traffic", "Fibre optic cable reserved for emergency services"],
      answer: 1,
      why: "The slides define dark fibre as unused fibre optic cable — cable that is in place but carries no light and therefore no traffic, and which can be leased and activated by another party.", sec: "s10" },
    { q: "At what altitude does the slides' Starlink example deploy its satellites?",
      choices: ["55 km", "550 km", "5,500 km", "35,786 km"],
      answer: 1,
      why: "The slide states a global deployment of satellites at 550 km above Earth, aimed at delivering high speed broadband internet where access has been unreliable, expensive or unavailable. The 35,786 km figure is geostationary altitude, not Starlink's.", sec: "s10" },
    { q: "Which of these is NOT one of the wireless network examples given in the slides?",
      choices: ["Bluetooth", "IEEE 802.11 series wireless network", "LTE mobile phone network", "IEEE 802.5 token ring network"],
      answer: 3,
      why: "The slide names Bluetooth, the IEEE 802.11 series wireless network and the LTE mobile phone network. IEEE 802.5 is Token Ring, a wired LAN standard, not a wireless one.", sec: "s11" },
    { q: "What does a wireless network use a 'cell' for?",
      choices: ["To interconnect mobile devices within a coverage area served by a base station", "To store frames that failed their error check", "To convert analog signals back into digital form", "To assign MAC addresses to new stations"],
      answer: 0,
      why: "The slide states that a wireless network uses a 'cell' to interconnect mobile devices. A cell is the coverage area served by one base station or access point, and frequency reuse across cells is what lets a fixed spectrum serve a whole city.", sec: "s11" },
    { q: "What does the physical layer do with frames received from the data link layer?",
      choices: ["Routes them toward the destination network", "Translates them into electrical, optical or electromagnetic signals representing 0 and 1 values", "Numbers them so they can be reordered at the receiver", "Encrypts them using a session key"],
      answer: 1,
      why: "The slide defines the physical layer's job as translating frames received from the data link layer (layer 2) into electrical, optical, or electromagnetic signals representing 0 and 1 values, or bits.", sec: "s12" },
    { q: "Which of these is included in a physical-layer specification according to the slides?",
      choices: ["Frame boundaries and sequence numbers", "The type of cable and connectors used, the electrical signals on each pin, and how bit values become physical signals", "Port numbers and transport protocol selection", "Logical addresses and route metrics"],
      answer: 1,
      why: "The slide's specification list is the type of cable and connectors used, the electrical signals associated with each pin and connector, and the manner in which bit values are converted into physical signals. The other options are layer 2, 3 and 4 concerns.", sec: "s12" },
    { q: "According to the slides, how may data be represented in analog form?",
      choices: ["Only by varying the voltage of the wave", "By varying the voltage, by varying the frequency, or by varying the phase of a wave", "Only by varying the frequency of the wave", "By varying the number of bits carried per symbol"],
      answer: 1,
      why: "The slide states that data are represented in analog form by varying the voltage of the wave, by varying the frequency, or by varying the phase of a wave. Those three correspond to the three parameters of a sine wave.", sec: "s13" },
    { q: "In the slides' digital example, how are binary 1 and binary 0 represented?",
      choices: ["Binary 1 as +5 V and binary 0 as 0 V", "Binary 1 as 0 V and binary 0 as +5 V", "Binary 1 as +12 V and binary 0 as −12 V", "Binary 1 as a 1 kHz tone and binary 0 as a 2 kHz tone"],
      answer: 0,
      why: "The slide's example is that a binary 1 can be represented as +5 V and a binary 0 can be represented as 0 V. Tone representation belongs to modulation schemes rather than to this baseband example.", sec: "s13" },
    { q: "Why is analog transmission needed according to the slides?",
      choices: ["Because analog transmission is always faster than digital transmission", "Because analog transmission is needed when bandwidth is limited, and limited bandwidth does not allow a digital signal to pass through", "Because digital signals cannot represent binary data reliably in any medium", "Because analog transmission requires no modulator or demodulator"],
      answer: 1,
      why: "The slide states plainly that analog transmission is needed when bandwidth is limited, that limited bandwidth in a medium does not allow a digital signal to pass through, and that digital signals are therefore modulated into analog signals before transmission.", sec: "s14" },
    { q: "In the slide's analog transmission diagram, what appears at the sending and receiving ends respectively?",
      choices: ["A demodulator at the sending end and a modulator at the receiving end", "A modulator at the sending end and a demodulator at the receiving end", "A multiplexer at both ends", "An amplifier at both ends"],
      answer: 1,
      why: "The diagram shows a modulator on the sending side and a demodulator on the receiving side, with modulators and demodulators again at the far end for the return direction. That modulator-demodulator pair is what a modem is.", sec: "s14" },
    { q: "Which statement about the IEEE 802 project is correct?",
      choices: ["IEEE assumed responsibility for LAN standards, primarily for the physical and data link layers, using the OSI reference model as a framework", "IEEE standardised the transport and network layers before working on LANs", "IEEE 802 replaced the OSI reference model entirely", "IEEE 802 standards cover only wireless technologies"],
      answer: 0,
      why: "The slide states that in the early days of networking there were no standards and organisations were locked into vendors, so IEEE assumed responsibility for setting LAN standards, primarily for the physical and data link layers, using the OSI reference model as a framework.", sec: "s9" },
    { q: "Which IEEE 802 standard is Ethernet, and which access method does it use?",
      choices: ["802.3, using CSMA/CD", "802.4, using token passing", "802.5, using token passing", "802.11, using CSMA/CA"],
      answer: 0,
      why: "802.3 is Ethernet and uses CSMA/CD, a contention-based ALOHA-style access method. 802.4 is Token Bus and 802.5 is Token Ring, both token based; 802.11 is wireless LAN.", sec: "s9" },
    { q: "A network spans a city and is operated by a single cable-television operator to link many office LANs. Which category does it belong to?",
      choices: ["PAN", "LAN", "MAN", "WAN"],
      answer: 2,
      why: "This is a metropolitan area network: city-scale span, typically owned by a single operator and used to connect multiple LANs. It is larger than a LAN and smaller than a long-haul carrier WAN.", sec: "s7" },
    { q: "Which topology gives every station a dedicated link to a single central device?",
      choices: ["Bus", "Star", "Ring", "Full mesh"],
      answer: 1,
      why: "In a star topology every station connects to a central device over its own dedicated link, so one cable fault isolates a single station. On a bus all stations share one backbone; on a ring each station connects to two neighbours.", sec: "s8" },
    { q: "A channel passes only 300 Hz to 3300 Hz. Why can an ordinary baseband digital signal not be sent down it?",
      choices: ["Because the channel's bandwidth is too high for digital signals", "Because the channel does not pass the low-frequency content a baseband digital signal needs to hold its shape", "Because baseband signals can only travel over fibre", "Because the channel is unguided rather than guided"],
      answer: 1,
      why: "The channel is bandpass and does not extend down to 0 Hz, so the low-frequency content of a baseband digital waveform is cut off and the signal arrives too deformed to decode. Modulating it onto a carrier inside the passband solves this.", sec: "s14" },
    { q: "A binary code 1100 is transmitted with +5 V for 1 and 0 V for 0, using two levels. How many bits does each level carry?",
      choices: ["4 bits", "2 bits", "1 bit", "0.5 bit"],
      answer: 2,
      why: "With L levels, each level carries log2 L bits. Here L = 2, so log2 2 = 1 bit per level — the ordinary binary signalling case. Four levels would carry 2 bits each, but the scheme described uses only two.", sec: "s13" },
    { q: "A frame leaves a wireless laptop, crosses an access point and continues over an Ethernet cable. What stays unchanged across that boundary?",
      choices: ["The MAC addresses in the frame", "The frame format and maximum frame size", "The IP packet carried inside the frame", "The medium access rules in use"],
      answer: 2,
      why: "The frame format, MAC addresses, maximum frame size and access rules all change at each link-layer boundary, because those are per-hop concerns. The IP packet inside is untouched, since layer-3 addressing is an end-to-end concern.", sec: "s15" },
  ],
});
