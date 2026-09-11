window.NSCOM_MODULES = window.NSCOM_MODULES || [];
window.NSCOM_MODULES.push({
  id: "m09",
  num: 9,
  title: "Data Link Protocols — WANs",
  accent: "#ffd166",
  icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6.5 18h10a4 4 0 0 0 .6-7.95 5.5 5.5 0 0 0-10.7-1.2A4.4 4.4 0 0 0 6.5 18Z"/><path d="M3 21.5h18"/><circle cx="8.2" cy="14" r=".9"/><circle cx="12" cy="14" r=".9"/><circle cx="15.8" cy="14" r=".9"/></svg>`,
  summary:
    "This module is the wide-area side of the data link story as the slides frame it: the IEEE 802 family of working groups and where 802.11 and 802.16 sit inside it; the 802.11 architecture of basic service sets, access points, extended service sets and the distribution system, with the three station-mobility classes; the physical-layer choices that carry WLAN bits (infrared, FHSS, DSSS, HR-DSSS, OFDM) and how 802.11a, b and g differ; the MAC sublayer with DCF/PCF, CSMA/CA, the RTS/CTS handshake, DIFS/SIFS interframe spaces and the NAV; the 802.11 frame format, frame-control subfields, control-frame subtypes and the four addressing cases; and Bluetooth, from piconets and scatternets through the radio, baseband, link-manager and L2CAP layers to SCO and ACL links. Additive textbook depth fills in the theory the slides point at but do not derive — the hidden- and exposed-station geometry, why carrier sensing cannot replace collision detection over radio, the timing budget of a controlled access, and the framing and error-recovery machinery shared by wide-area data link protocols.",
  sections: [
    {
      id: "s1",
      title: "Where These Protocols Sit: IEEE 802 Working Groups",
      body: [
        {
          type: "fig",
          fig: "m09-p02-ieee-802-standards-working-groups",
          caption: "The IEEE 802 working groups named in the slides, including 802.11 for wireless LANs and 802.16 for broadband wireless access.",
        },
        {
          type: "list",
          items: [
            "The **IEEE 802** project is organised into numbered working groups, each owning a technology.",
            "**802.11 = Wi-Fi** (wireless LAN); **802.16 = WiMAX** (wireless MAN).",
            "This module is about what changes when the link has **no cable**.",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "the working groups",
          body: [
            {
              type: "p",
              text: "The IEEE 802 project is the standards body that writes the rules for local and metropolitan area networks, and it is organised as a set of numbered working groups, each owning one family of link technologies. The same two-layer split you already know from the OSI data link layer is baked into every 802 standard: an upper logical link control sublayer that is common across technologies, and a lower media access control sublayer that is specific to the medium and is therefore different for Ethernet, wireless and personal-area networks.",
            },
            {
              type: "p",
              text: "Two members of that family dominate ordinary conversation. Wi-Fi is the brand name attached to IEEE 802.11, the wireless local area network standard, and WiMAX, standing for Worldwide Interoperability for Microwave Access, is the brand name attached to IEEE 802.16, which was designed for broadband wireless access over much longer distances than a WLAN covers. The 802 project also maintains a Technical Advisory Group that coordinates work spanning several working groups rather than owning one technology.",
            },
            {
              type: "table",
              head: ["Working group", "Scope", "Familiar brand or name"],
              rows: [
                ["802.1", "Bridging, VLANs and higher-layer LAN protocols", "Spanning tree, VLAN tagging"],
                ["802.3", "Carrier-sense multiple access with collision detection over wired media", "Ethernet"],
                ["802.11", "Wireless local area networks", "Wi-Fi"],
                ["802.15", "Wireless personal area networks", "Bluetooth (802.15.1), Zigbee (802.15.4)"],
                ["802.16", "Broadband wireless access over metropolitan distances", "WiMAX"],
                ["802.18/802.19", "Regulatory and coexistence advisory", "Coexistence of wireless standards"],
              ],
            },
            {
              type: "p",
              text: "The reason a single link-layer standard cannot serve all media is that the physical layer imposes different constraints on the MAC sublayer. A wired medium lets every station hear every other station's transmission and detect a collision by watching the voltage on the cable, so carrier-sense multiple access with collision detection works cleanly. A radio medium does not: a station cannot easily transmit and listen at the same time, cannot always hear a distant station, and cannot reliably separate a faint incoming signal from its own outgoing energy. That single difference, explained fully later in this module, is why the slides move from the wired assumptions of Ethernet to the collision-avoidance machinery of 802.11.",
            },
            {
              type: "note",
              text: "Exam tip: be ready to name 802.11 as the wireless LAN standard and 802.16 as the broadband wireless access standard, and to state that 802.1 covers bridging and VLANs rather than a radio technology. The slides use the brand names Wi-Fi and WiMAX, so expect either form of the question.",
            },
          ],
        },
      ],
    },
    {
      id: "s2",
      title: "Introduction to the Wireless LAN Problem",
      body: [
        {
          type: "fig",
          fig: "m09-p03-introduction",
          caption: "The four topics the slides introduce for the wireless LAN: architecture, physical layer, MAC layer and addressing mechanism.",
        },
        {
          type: "list",
          items: [
            "A wireless LAN standard must define four things: **architecture, physical layer, MAC sublayer, addressing**.",
            "The order is a **dependency chain** — architecture decides how many devices a frame crosses, which decides the rest.",
            "Treat that list as the outline of the whole module.",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "why that order",
          body: [
            {
              type: "p",
              text: "The introduction slide lays out the four things a wireless LAN standard has to define, and it is worth treating that list as the outline of the whole module. First, the architecture: how stations group into cells, how cells connect to each other, and how a station moves between them. Second, the physical layer: how a bit becomes a radio signal, which frequency band is used, which modulation is applied, and how fast data can be pushed through. Third, the MAC layer: who is allowed to transmit at any given instant, because the medium is shared and uncontrolled transmission destroys everyone's frames. Fourth, the addressing mechanism: how a frame names its source, its destination and the access point it travelled through, given that frames routinely cross three different devices along a single path.",
            },
            {
              type: "p",
              text: "These four concerns are not independent, and the slides' ordering is the dependency order. The architecture determines how many devices a frame can pass through, and therefore how many addresses the frame header must be able to carry. The physical layer determines whether a station can hear its neighbours reliably, and therefore whether the MAC can use carrier sensing alone or needs an explicit handshake. The MAC in turn determines the frame format, because the control information the MAC needs, such as retry flags and power-management bits, has to have a home in a header field.",
            },
            {
              type: "h3",
              text: "The two halves of the data link layer",
            },
            {
              type: "p",
              text: "Every 802 technology splits the data link layer into logical link control on top and media access control below. Logical link control presents one uniform interface up to the network layer, so that IP does not care whether the frame is about to travel over copper, fibre or radio. Media access control owns the medium-specific problem: framing, addressing, and deciding who transmits next. When the slides say that the MAC layer is a module topic and the addressing mechanism is a separate module topic, they are separating the access rules from the header layout even though both live in the same sublayer.",
            },
            {
              type: "list",
              items: [
                "Logical link control: common interface to the network layer, flow and error control across the link.",
                "Media access control: framing, physical addressing, and arbitration of the shared medium.",
                "The split lets the network layer be written once while the link technologies underneath change freely.",
              ],
            },
          ],
        },
      ],
    },
    {
      id: "s3",
      title: "802.11 Architecture: Basic Service Sets and the ESS",
      body: [
        {
          type: "fig",
          fig: "m09-p04-ieee-802-11-architecture",
          caption: "The 802.11 architecture, showing basic service sets and how they compose into an extended service set.",
        },
        {
          type: "fig",
          fig: "m09-p05-basic-service-set",
          caption: "A basic service set: stations plus, optionally, a central access point.",
        },
        {
          type: "fig",
          fig: "m09-p06-ess-extended-service-set",
          caption: "An extended service set: two or more basic service sets joined by a distribution system, usually a wired LAN.",
        },
        {
          type: "list",
          items: [
            "The building block is the **BSS (Basic Service Set)** — a cell of wireless stations.",
            "Add a **DS (Distribution System)** and BSSs join into an **ESS (Extended Service Set)** — one logical network.",
            "The **AP (Access Point)** is the station that bridges the wireless cell to the wired DS.",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "BSS, ESS and the DS",
          body: [
            {
              type: "p",
              text: "The 802.11 architecture is built from cells. The smallest building block is the basic service set, made up of stationary or mobile wireless stations. When a basic service set also contains a central base station, that base station is called an access point, and it is the access point that relays traffic between the wireless stations in its cell and anything outside the cell. A basic service set without an access point is called a stand-alone or independent set: its stations can talk to each other directly, peer to peer, but they cannot send data to stations in any other basic service set, because nothing connects the cells together.",
            },
            {
              type: "p",
              text: "A station is the wireless equivalent of a network interface card address: it is an addressable entity with a MAC address and a physical-layer radio. Stations come in two flavours in this standard's vocabulary. A station that is a fixed part of the infrastructure is called a base station or access point, and it is one of the stations in a basic service set that has the job of relaying. A station that is a user device, laptop or phone, is simply called a station and it may be stationary or mobile. The access point is not a router and not a switch in the classic sense: it is a bridge that converts between the 802.11 frames on the wireless side and the framing of the distribution system on the wired side.",
            },
            {
              type: "p",
              text: "To cover more than one cell, two or more basic service sets with access points are joined by a distribution system, which in most deployments is an ordinary wired LAN. The result is an extended service set. The distribution system is the backbone that carries frames from one access point to another, and to the outside world, and the standard deliberately does not specify what technology it uses: it may be Ethernet, it may be another 802.11 channel, and the only requirement is that it can move a frame between access points. The union of the access points plus the distribution system is what the standard calls the portal, the point at which traffic enters and leaves the wireless system.",
            },
            {
              type: "table",
              head: ["Term", "What it is", "What it is not"],
              rows: [
                ["Station", "Addressable device with a MAC address and a radio", "Not necessarily a user device; an AP is a station too"],
                ["Basic service set", "One cell: stations sharing a coverage area", "Cannot reach other cells without an AP and a DS"],
                ["Access point", "A station that relays between the wireless cell and the DS", "Not a router; it bridges at the link layer"],
                ["Distribution system", "Backbone joining access points", "Technology is unspecified; usually a wired LAN"],
                ["Extended service set", "Two or more BSSs joined by a DS", "Not a single radio cell; stations roam between BSSs"],
              ],
            },
            {
              type: "note",
              text: "A useful mental model: the basic service set is a cell, the access point is the cell's door, the distribution system is the corridor, and the extended service set is the building. A station can walk from one cell to another only if there is a door and a corridor connecting them.",
            },
          ],
        },
      ],
    },
    {
      id: "s4",
      title: "Station Mobility Classes",
      body: [
        {
          type: "fig",
          fig: "m09-p07-station-types",
          caption: "The three station mobility classes: no transition, BSS transition and ESS transition.",
        },
        {
          type: "list",
          items: [
            "Three mobility classes: **no-transition, BSS-transition, ESS-transition**.",
            "**No-transition**: stationary or moving only within one BSS.",
            "**ESS-transition** lets a station move between BSSs in the same ESS — the network survives the move.",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "the mobility classes",
          body: [
            {
              type: "p",
              text: "The slides define three mobility classes, and the distinctions matter because they bound what the network can promise. No-transition mobility means the station is either stationary or moving only inside a single basic service set. Because the station never leaves its cell, no handover logic is needed and the network never has to re-route traffic to a new access point. This is the normal case for a desktop replacement or a laptop that stays in one room.",
            },
            {
              type: "p",
              text: "BSS-transition mobility means the station can move from one basic service set to another, but both sets belong to the same extended service set. Because the distribution system already connects the access points, the station can hand over from one access point to the next while keeping the same address and, in a well-behaved network, the same session. The cost is that the higher layers see a brief interruption of link connectivity, and some frames may be lost during the handover unless the access points buffer them.",
            },
            {
              type: "p",
              text: "ESS-transition mobility means the station can move from one extended service set to another. This is the hardest case: the station is moving between two independently administered wireless systems, so the address and the routing of traffic to the station change, and the link-layer handover is no longer sufficient on its own. In the Internet model this is exactly the case mobile IP was invented to handle, because the station's IP address no longer identifies its point of attachment once it crosses into a new domain.",
            },
            {
              type: "table",
              head: ["Mobility class", "Movement allowed", "What the network must do", "Typical case"],
              rows: [
                ["No transition", "Stationary, or within one BSS", "Nothing beyond ordinary access-point service", "Fixed desktop, laptop in one room"],
                ["BSS transition", "Between BSSs inside one ESS", "Hand over between access points on the same DS", "Walking down a floor of one building"],
                ["ESS transition", "Between one ESS and another", "Re-home the station; link handover alone is not enough", "Moving between two separate campuses"],
              ],
            },
            {
              type: "note",
              text: "Exam tip: the three classes are defined by the boundary that is crossed, not by the speed of movement. A fast-moving station that stays inside one cell is still no-transition mobility, and a slow station that crosses into a second ESS is ESS-transition mobility.",
            },
          ],
        },
      ],
    },
    {
      id: "s5",
      title: "Physical Layer: FHSS and DSSS",
      body: [
        {
          type: "fig",
          fig: "m09-p09-fhss-frequency-hopping-spread-spectr",
          caption: "Frequency-hopping spread spectrum: the carrier steps through a repeating sequence of narrow channels.",
        },
        {
          type: "fig",
          fig: "m09-p10-frequency-hopping-example",
          caption: "A worked frequency-hopping example, showing the carrier occupying successive narrow subbands in time.",
        },
        {
          type: "fig",
          fig: "m09-p11-dsss-direct-sequence-spread-spectrum",
          caption: "Direct sequence spread spectrum: each data bit is replaced by a chip code, widening the occupied band.",
        },
        {
          type: "list",
          items: [
            "**FHSS** — hop between frequencies in a fixed pattern. **DSSS** — spread the signal with a wide code.",
            "Both are **spread spectrum**: the signal is deliberately widened across a band.",
            "Spreading buys **resistance to interference** and makes the signal harder to intercept.",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "how spreading works",
          body: [
            {
              type: "p",
              text: "The 802.11 standard defines physical-layer specifications that convert bits into a signal, and the slides walk through four approaches. Frequency-hopping spread spectrum, FHSS, works by having the sender transmit on one carrier frequency for a short time, then hop to another frequency for the same length of time, then another, and so on, eventually repeating the whole cycle. Because the receiver must know the hopping sequence to follow along, an unauthorised listener sees a signal that keeps jumping across the band and finds it much harder to make sense of the data. That resistance to interception is a genuine benefit, though the primary engineering motive is interference tolerance: a narrow interferer spoils only the hops that land on it, not the whole transmission.",
            },
            {
              type: "p",
              text: "The slides give the concrete numbers for the original FHSS variant. It uses the 2.4 GHz industrial, scientific and medical band, which the standard treats as covering roughly 2.4 to 2.4835 GHz, divided into 79 subbands each one megahertz wide. Modulation is frequency shift keying, either two-level or four-level, which carries one or two bits per baud and produces a data rate of one or two megabits per second respectively. The dwell time, the minimum time the carrier stays on one subband before hopping, is 400 milliseconds in the slide's figures, and every station in the cell must use the same pseudo-random number generator so that all of them hop together in lockstep.",
            },
            {
              type: "h3",
              text: "Direct sequence spread spectrum",
            },
            {
              type: "p",
              text: "Direct sequence spread spectrum, DSSS, takes a different route to the same goal. Instead of hopping the carrier, each data bit is replaced by a chip code, a fixed pattern of much shorter pulses, so that the signal occupies a wider band than the data alone would need. The receiver knows the chip code and correlates the incoming signal against it, which collapses the wanted signal back to narrowband while spreading any interference across the band where it can be filtered out. The slides are careful to note that this is a physical-layer technique, similar in spirit to code division multiple access but not a multiple-access data link method: DSSS here is used to spread one station's transmission, not to let several stations share the medium by code.",
            },
            {
              type: "p",
              text: "The original DSSS physical layer also uses the 2.4 GHz band and modulates with phase shift keying, either binary PSK or quadrature PSK. The high-rate descendant, HR-DSSS, keeps the same band and the same spreading idea but adds complementary code keying, which maps four or eight bits onto one CCK symbol and thereby raises the data rate considerably without widening the channel.",
            },
            {
              type: "table",
              head: ["Physical layer", "Band", "Spreading", "Modulation", "Data rates"],
              rows: [
                ["802.11 infrared", "Optical, line of sight", "None", "Baseband optical", "1 or 2 Mbps"],
                ["802.11 FHSS", "2.4 GHz ISM", "Hop across 79 x 1 MHz subbands", "2-level or 4-level FSK", "1 or 2 Mbps"],
                ["802.11 DSSS", "2.4 GHz ISM", "Chip code per bit", "BPSK or QPSK", "1 or 2 Mbps"],
                ["802.11b HR-DSSS", "2.4 GHz ISM", "Chip code plus CCK", "BPSK or QPSK", "1, 2, 5.5, 11 Mbps"],
                ["802.11a OFDM", "5 GHz ISM", "48 data subcarriers", "PSK and QAM", "6 to 54 Mbps"],
                ["802.11g OFDM", "2.4 GHz ISM", "48 data subcarriers", "PSK and QAM", "Up to 54 Mbps"],
              ],
            },
            {
              type: "note",
              text: "The slide notes single out multipath fading as the main issue for FHSS. When a transmitted signal reflects off walls and furniture, several copies arrive at the receiver at slightly different times, and they add constructively or destructively. Because the copies land on different frequencies, hopping helps: a deep fade on one subband costs only the frames sent during that hop, and the next hop is likely to be clean.",
            },
          ],
        },
      ],
    },
    {
      id: "s6",
      title: "Infrared, FHSS and the 2.4 GHz Band in Detail",
      body: [
        {
          type: "fig",
          fig: "m09-p12-802-11",
          caption: "The original 802.11 physical-layer variants, including infrared and FHSS, with their bands, channels and dwell time.",
        },
        {
          type: "list",
          items: [
            "**Infrared** was an original 802.11 PHY: 1–2 Mbps, ~10–20 m, and it needs line of sight.",
            "**FHSS** uses **79 non-overlapping 1 MHz channels** in the 2.4 GHz ISM band.",
            "All stations in a cell hop **in step** — the pattern is the coordination mechanism.",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "the 2.4 GHz detail",
          body: [
            {
              type: "p",
              text: "Infrared was one of the original 802.11 physical layers and it is the simplest to explain. It carries one or two megabits per second over a range of roughly ten to twenty metres, cannot penetrate walls, and does not work outdoors because sunlight and other infrared sources swamp the receiver. Its virtue is confinement: because the signal stops at a wall, an infrared cell is naturally isolated from the cell next door, and an eavesdropper outside the room hears nothing. Its vice is that the same property makes coverage awkward, since every room needs its own access point and users must stay in line of sight of it.",
            },
            {
              type: "p",
              text: "For FHSS the slides add detail worth memorising. There are 79 non-overlapping channels, each one megahertz wide, at the low end of the 2.4 GHz ISM band. All stations in the cell share the same pseudo-random number generator, so the hopping sequence is identical everywhere and a station that knows the seed knows exactly where the carrier will be at any instant. The dwell time, the minimum time the station stays on a channel before hopping, is 400 milliseconds as the slides state it. Choosing the dwell time is a trade: a long dwell gives the receiver more time to lock on and lowers the overhead of switching, while a short dwell improves resistance to a narrowband interferer because the carrier leaves the jammed subband sooner.",
            },
            {
              type: "h3",
              text: "Hops, dwell time and the number of channels",
            },
            {
              type: "p",
              text: "It is worth being able to reason numerically about the hopping scheme, because it turns the 79-channel figure into something you can use. If the carrier visits every one of the 79 subbands once before the sequence repeats, and it dwells 400 milliseconds on each, then one complete cycle of the hopping pattern takes the product of the two. If a jammer occupies a single subband, it can only damage the transmission during the hops that land there, which is a small and predictable fraction of the time.",
            },
            {
              type: "example",
              text: "An FHSS cell hops through all 79 subbands of the 2.4 GHz ISM band, dwelling 400 milliseconds on each before moving on. Work out how long one full hopping cycle takes, and what fraction of the time a jammer sitting on exactly one subband can disrupt the link.",
              steps: [
                "One cycle visits every subband once: 79 hops, each lasting 400 ms = 0.4 s.",
                "Cycle time = 79 x 0.4 s = 31.6 s.",
                "A jammer occupies one of the 79 subbands, so it overlaps the carrier for 1 hop out of every 79.",
                "Fraction of time disrupted = 1/79 = about 1.27 per cent of the time.",
                "In one cycle the disruption lasts 400 ms total, out of 31 600 ms of transmission.",
              ],
            },
            {
              type: "note",
              text: "The 2.4 GHz band is licence-free and therefore crowded: microwave ovens, cordless phones and Bluetooth all live there. Spread spectrum is the tool the standard uses to survive that crowding, which is why both the FHSS and DSSS physical layers occupy a band far wider than the data rate strictly needs.",
            },
          ],
        },
      ],
    },
    {
      id: "s7",
      title: "802.11a, b and g: OFDM and HR-DSSS",
      body: [
        {
          type: "fig",
          fig: "m09-p13-802-11a-b-g",
          caption: "802.11a, b and g compared: OFDM in the 5 GHz band, HR-DSSS in 2.4 GHz, and OFDM again in 2.4 GHz with backward compatibility.",
        },
        {
          type: "list",
          items: [
            "**OFDM** (orthogonal frequency division multiplexing) splits the band into many **subcarriers** sent in parallel.",
            "**802.11a** = 5 GHz OFDM: **52 subcarriers, 48 for data and 4 for control** (pilot tones).",
            "**802.11b** used HR-DSSS at 2.4 GHz; **802.11g** brought OFDM to 2.4 GHz.",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "OFDM subcarriers",
          body: [
            {
              type: "p",
              text: "The letters that follow 802.11 mark physical-layer amendments, and the slides work through a, b and g. OFDM, orthogonal frequency division multiplexing, is the technique that makes the high rates possible. Instead of sending one stream of symbols on one carrier, OFDM splits the available band into many narrow subcarriers and sends a group of bits on each, all in parallel, with the subcarrier spacing chosen so that the carriers are orthogonal and do not interfere with each other. Because each subcarrier is narrow, a multipath delay spread that would smear a wideband single-carrier signal distorts each subcarrier far less, and a cyclic prefix can absorb the residual echo entirely.",
            },
            {
              type: "p",
              text: "802.11a is the 5 GHz OFDM variant. It divides its band into 52 subcarriers, of which 48 carry data and 4 carry control information such as pilot tones used for channel estimation and phase tracking. With 48 subcarriers each carrying a group of bits per symbol, the standard reaches 18 megabits per second using PSK and 54 megabits per second using quadrature amplitude modulation, with the exact rate chosen per transmission from a set that steps down through lower-order modulation and stronger coding as the channel gets worse. The 5 GHz band is less crowded than 2.4 GHz, which is an advantage, but higher frequencies attenuate faster, so 802.11a cells are somewhat smaller for the same transmit power.",
            },
            {
              type: "p",
              text: "802.11b is the 2.4 GHz high-rate direct sequence variant, HR-DSSS. It keeps the DSSS physical layer and its spreading, and adds complementary code keying, which encodes four or eight bits into a single CCK symbol. It offers four data rates, 1, 2, 5.5 and 11 megabits per second. The slides attach the modulation to the rate in a way worth reading carefully: the two low rates are carried by the original DSSS schemes, and the higher rates pair with higher-order phase modulation. The crucial practical point is that 802.11b and 802.11a operate in different bands with different modulation and are incompatible with each other, so a client built for one cannot associate with an access point built for the other.",
            },
            {
              type: "p",
              text: "802.11g brings OFDM back to the 2.4 GHz band and reaches 54 megabits per second, and it is deliberately backward compatible with 802.11b. Backward compatibility means a g access point must be able to serve b clients, and it achieves that by speaking both physical layers: when a b client is associated, the access point protects the OFDM transmissions with the older scheme's mechanism so that the b stations, which cannot decode OFDM, still know to stay quiet. That protection costs throughput, which is the price of mixing generations in one cell.",
            },
            {
              type: "table",
              head: ["Variant", "Band", "Technique", "Modulation", "Peak rate", "Notes"],
              rows: [
                ["802.11 (orig)", "2.4 GHz or IR", "FHSS, DSSS, infrared", "FSK, PSK, baseband", "1-2 Mbps", "79 x 1 MHz channels for FHSS"],
                ["802.11a", "5 GHz", "OFDM, 48 data + 4 control subcarriers", "PSK (18 Mbps), QAM (54 Mbps)", "54 Mbps", "Incompatible with 802.11b"],
                ["802.11b", "2.4 GHz", "HR-DSSS with CCK", "DSSS, then BPSK/QPSK", "11 Mbps", "Rates 1, 2, 5.5, 11 Mbps"],
                ["802.11g", "2.4 GHz", "OFDM", "PSK and QAM", "54 Mbps", "Backward compatible with 802.11b"],
              ],
            },
            {
              type: "note",
              text: "Exam tip: the most commonly asked contrast is that 802.11a lives in the 5 GHz band while 802.11b and 802.11g live in 2.4 GHz, and that a and b are mutually incompatible. Remember also that g is the one with backward compatibility with b, and that the 48 plus 4 subcarrier split belongs to 802.11a.",
            },
          ],
        },
      ],
    },
    {
      id: "s8",
      title: "MAC Sublayer: DCF, PCF and Why Not CSMA/CD",
      body: [
        {
          type: "fig",
          fig: "m09-p15-mac-layers-in-ieee-802-11-standard",
          caption: "The MAC sublayer organisation: PCF layered on top of DCF, and DCF as the mandatory contention-based function.",
        },
        {
          type: "fig",
          fig: "m09-p16-csma-ca",
          caption: "Why CSMA/CD does not transfer to the wireless medium: half-duplex radio, the hidden terminal, and signal fading with distance.",
        },
        {
          type: "list",
          items: [
            "802.11 defines two coordination functions: **DCF** (mandatory) and **PCF** (optional).",
            "**DCF** is distributed — every station runs it and they contend via CSMA/CA. **PCF** is centralised, polled by the AP.",
            "**CSMA/CD cannot be reused**: a radio cannot hear a collision while it is transmitting.",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "DCF vs PCF",
          body: [
            {
              type: "p",
              text: "The MAC layer in 802.11 is defined in terms of two coordination functions. The distributed coordination function, DCF, is the mandatory one: every station implements it, it uses no central controller, and it is a contention-based method in which stations compete for the medium in a distributed way. The point coordination function, PCF, is optional: it is implemented on top of DCF and lets an access point poll stations in a controlled, contention-free period so that a station with delay-sensitive traffic can be given a turn. PCF gives predictable timing at the cost of needing an access point that runs the poll.",
            },
            {
              type: "p",
              text: "The slides then explain why the wired access method cannot simply be reused. Carrier-sense multiple access with collision detection, the method Ethernet uses, requires a station to keep listening to the medium while it transmits so that it can notice the moment its own signal is corrupted by another station's. The slides give three reasons this fails over radio. First, collision detection implies the ability to send and receive at the same time, which means a station needs separate transmit and receive chains and a duplexer, making the station costly and also increasing the bandwidth it must occupy. Second, a collision may simply not be detectable because of a hidden terminal, a station the sender cannot hear but which can hear the receiver's surroundings. Third, distance causes signal fading, so even a distant station whose transmission does collide may arrive too weak to be recognised as a collision at all.",
            },
            {
              type: "p",
              text: "The fix is to replace collision detection with collision avoidance. Carrier-sense multiple access with collision avoidance, CSMA/CA, keeps the carrier-sense step, so a station still listens before transmitting, but it adds two mechanisms to cope with the fact that a clean listen does not guarantee a clean transmission. The first is an explicit acknowledgement for every unicast data frame, so the sender learns whether the frame survived. The second is an optional four-way handshake, request to send followed by clear to send, which reserves the medium by telling every station in range of the receiver to be silent for a stated duration.",
            },
            {
              type: "table",
              head: ["Function", "Who runs it", "Contention", "Purpose"],
              rows: [
                ["DCF", "Every station, no controller", "Yes, stations compete", "Mandatory distributed medium access"],
                ["PCF", "Access point polls stations", "No, contention-free period", "Optional bounded-delay service"],
                ["CSMA/CD", "Ethernet stations", "Yes, with detection", "Not usable over radio; needs simultaneous send and receive"],
                ["CSMA/CA", "802.11 stations", "Yes, with avoidance", "Carrier sense plus acknowledgement and optional RTS/CTS"],
              ],
            },
            {
              type: "note",
              text: "A single sentence to carry into the exam: wired Ethernet detects collisions because it can hear its own corruption on the cable, while wireless must avoid them because it cannot hear a collision that happens at the far end of the cell.",
            },
          ],
        },
      ],
    },
    {
      id: "s9",
      title: "Hidden and Exposed Terminals",
      body: [
        {
          type: "fig",
          fig: "m09-p17-hidden-and-exposed-terminals",
          caption: "The hidden station problem and the exposed station problem, side by side.",
        },
        {
          type: "fig",
          fig: "m09-p18-another-example-for-exposed-terminal",
          caption: "A second exposed-terminal example showing a station needlessly deferring because it hears an unrelated neighbour.",
        },
        {
          type: "list",
          items: [
            "**Hidden terminal**: A and C both reach the AP but cannot hear each other, so they collide at the AP.",
            "**Exposed terminal**: B waits unnecessarily because it hears a transmission that would not have affected it.",
            "Hidden nodes lose frames; exposed nodes just lose time. **RTS/CTS** addresses both.",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "both terminal problems",
          body: [
            {
              type: "p",
              text: "The hidden-station problem is the reason a wireless MAC cannot rely on carrier sensing alone. In the slides' picture, two stations that are both inside the coverage of one access point may be outside each other's coverage, because radio range is not symmetric with the geometry of the room and because obstacles attenuate signals differently in different directions. Station A senses the medium, hears nothing, and starts transmitting to the access point. Station C is far from A but close to the access point, so C's carrier sense also finds the medium idle and C also transmits. Both signals arrive at the access point and destroy each other. Neither sender ever detects a collision, because each is deaf to the other, so the frame loss is invisible to the senders and is only discovered later through a missing acknowledgement and a retransmission.",
            },
            {
              type: "p",
              text: "The exposed-station problem is the mirror image, and it is a lost opportunity rather than a lost frame. Two stations, B and C, are close enough to hear each other, but each is sending to a different receiver that is far away on its own side. When B is transmitting to its access point, C hears the transmission on the medium and, following the carrier-sense rule, politely defers even though C's own receiver is in a completely different direction and C's transmission would not have collided with B's at all. Throughput suffers because C is blocked by a transmission that is harmless to it.",
            },
            {
              type: "p",
              text: "The standard's answer to the hidden-station problem is the four-way handshake. Before sending data, the sender transmits a short request-to-send frame naming the intended receiver and stating how long the exchange will take. The receiver answers with a clear-to-send frame, which is heard by every station in range of the receiver, including the hidden station that could not hear the original sender. A station that hears either frame reads the duration and sets its network allocation vector for that long, which is a promise to itself to stay off the medium. In effect, the CTS broadcasts the sender's reservation using the receiver's voice, reaching exactly the stations that needed to hear it.",
            },
            {
              type: "table",
              head: ["Problem", "Geometry", "Consequence", "Standard's handling"],
              rows: [
                ["Hidden station", "Two senders cannot hear each other but both reach the receiver", "Simultaneous transmissions collide at the receiver; senders never detect it", "RTS/CTS handshake plus NAV"],
                ["Exposed station", "Two senders hear each other but their receivers are in different directions", "One station defers unnecessarily; throughput is wasted", "Mitigated by short control frames and by the NAV covering only the real reservation"],
                ["Collision detection", "Cannot be done reliably over half-duplex radio", "No immediate retransmission trigger", "Positive acknowledgement of every data frame"],
              ],
            },
            {
              type: "note",
              text: "Exam tip: the difference between the two problems is what the station hears. A hidden station hears nothing that should have stopped it, so it transmits into a collision. An exposed station hears something that did not need to stop it, so it stays quiet when it could have transmitted.",
            },
          ],
        },
      
        {
          type: "viz",
          viz: "hidden-terminal",
        },
      ],
    },
    {
      id: "s10",
      title: "CSMA/CA Procedure, Interframe Spaces and the NAV",
      body: [
        {
          type: "fig",
          fig: "m09-p19-csma-ca-flowchart",
          caption: "The CSMA/CA procedure: carrier sense, deferral, backoff countdown, transmission and positive acknowledgement.",
        },
        {
          type: "fig",
          fig: "m09-p20-csma-ca-and-nav",
          caption: "CSMA/CA timing with DIFS and SIFS, the RTS/CTS handshake and the network allocation vector protecting the exchange.",
        },
        {
          type: "list",
          items: [
            "**CSMA/CA**: sense the medium, wait if busy, then back off a random number of slots before transmitting.",
            "**SIFS** is the shortest gap (for ACKs and control); **DIFS** is longer (for new data). Shorter gap = priority.",
            "**NAV** is a countdown timer set from a heard RTS/CTS — it tells stations how long to stay quiet.",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "SIFS, DIFS and the NAV",
          body: [
            {
              type: "p",
              text: "The flow chart the slides show turns CSMA/CA into a procedure. A station that has a frame to send first senses the medium. If the medium is busy it waits; if it stays busy for a specified period it waits still longer. Once the medium has been idle for a distributed interframe space, the station begins a backoff countdown using a randomly chosen number of slots, and it decrements that counter only while the medium remains idle. Because two stations that became ready at the same moment will almost certainly choose different backoff counts, the medium is shared without any central scheduler, and the randomness is what prevents repeated head-on collisions between the same pair of stations.",
            },
            {
              type: "p",
              text: "Three timing quantities appear in the slide and carry the whole scheme. SIFS, the short interframe space, is the shortest gap and is granted to frames in an ongoing exchange, such as a clear-to-send, an acknowledgement, or a continuation fragment, so that the station which owns the current exchange keeps the medium and no other station can slip in. DIFS, the distributed interframe space, is longer and is the gap a station must observe before starting a new contention. Because SIFS is shorter than DIFS, a station already in an exchange always wins the medium over a station trying to start one, which is exactly how the protocol protects an acknowledged exchange without a central arbiter.",
            },
            {
              type: "p",
              text: "The network allocation vector is the other half of the reservation idea. Request-to-send and clear-to-send both carry a duration field, and any station that overhears either frame records that duration in its NAV, a local countdown that acts as a virtual carrier-sense signal: while the NAV is running down, the station treats the medium as busy and does not attempt to transmit, even if its physical carrier sense says the medium is free. The sliding note is the payoff and it is worth memorising exactly. Collision can only occur during the handshake period, the RTS and CTS exchange, because once the handshake has completed every station within range of either party has heard the duration and has set its NAV. Data frames then travel without contention.",
            },
            {
              type: "h3",
              text: "The timing budget of one exchange",
            },
            {
              type: "p",
              text: "Because the interframe spaces and the frame lengths are all known quantities, the duration of a protected exchange can be computed, and it is a good exercise to do once. Take a 1000-byte data frame at 11 megabits per second, control frames of 20 bytes for RTS and 14 bytes each for CTS and ACK sent at 1 megabit per second, a slot time of 20 microseconds and a SIFS of 10 microseconds. The DIFS is the sum of one SIFS and two slot times.",
            },
            {
              type: "example",
              text: "Compute DIFS, the full duration of one RTS/CTS protected data exchange, and the NAV value a listening station would set after hearing the RTS. Use slot time 20 microseconds, SIFS 10 microseconds, RTS 20 bytes and CTS/ACK 14 bytes at 1 Mbps, and a 1000-byte data frame at 11 Mbps.",
              steps: [
                "DIFS = SIFS + 2 x slot time = 10 + 2 x 20 = 50 microseconds.",
                "Transmission times at 1 Mbps: RTS = 20 x 8 / 1 = 160 us; CTS = 14 x 8 / 1 = 112 us; ACK = 112 us.",
                "Data frame at 11 Mbps: 1000 x 8 / 11 = 727.3 us.",
                "Total exchange = RTS + SIFS + CTS + SIFS + DATA + SIFS + ACK = 160 + 10 + 112 + 10 + 727.3 + 10 + 112 = 1141.3 us.",
                "A station that hears the RTS sets its NAV to cover everything after the RTS itself: SIFS + CTS + SIFS + DATA + SIFS + ACK = 981.3 us.",
                "So the medium is reserved, in effect, for about 1.14 milliseconds to move one kilobyte, and the overhead is 160 + 10 + 112 + 10 + 10 + 112 = 414 us of the total.",
              ],
            },
            {
              type: "note",
              text: "Exam tip: the ordering SIFS < DIFS is the whole reason an acknowledged exchange cannot be interrupted. If DIFS were shorter than SIFS, a new station could pre-empt a station that was mid-exchange, and acknowledgements would be useless.",
            },
          ],
        },
      
        {
          type: "viz",
          viz: "csma-ca",
        },
      ],
    },
    {
      id: "s11",
      title: "802.11 Frame Format and Frame Control Subfields",
      body: [
        {
          type: "fig",
          fig: "m09-p21-frame-format",
          caption: "The 802.11 frame format, with the frame control field, duration, addresses, sequence control, frame body and checksum.",
        },
        {
          type: "fig",
          fig: "m09-p22-subfields-in-fc-frame-control-field",
          caption: "The subfields inside the frame control field and what each one means.",
        },
        {
          type: "fig",
          fig: "m09-p23-control-frames",
          caption: "Control frames in 802.11, and the subtype values that identify RTS, CTS and ACK.",
        },
        {
          type: "fig",
          fig: "m09-p24-values-of-subfields-in-control-frame",
          caption: "The subtype assignments for the control frame type, including RTS 1011, CTS 1100 and ACK 1101.",
        },
        {
          type: "list",
          items: [
            "An 802.11 frame starts with the **frame control (FC)** field — two bytes that tell the receiver everything about the frame.",
            "FC carries the **type, subtype, To DS, From DS, retry, power, and more** bits.",
            "It is the most information-dense part of the header — most of what the MAC does is decided from it.",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "the FC subfields",
          body: [
            {
              type: "p",
              text: "An 802.11 frame begins with a frame control field that the slides abbreviate FC. That two-byte field is the most information-dense part of the header because it tells a receiving station everything it needs to interpret the rest: what version of the standard the frame follows, whether it is a management, control or data frame, which subtype it is, whether it is travelling to or from a distribution system, and a set of flags that modify how it should be handled. Getting the frame-control subfields straight is the difference between reading a frame capture correctly and misreading it entirely.",
            },
            {
              type: "table",
              head: ["FC subfield", "Meaning as the slides give it"],
              rows: [
                ["Version", "The current version of the protocol is 0."],
                ["Type", "The type of information: management 00, control 01, or data 10."],
                ["Subtype", "Defines the subtype within each type, for example RTS, CTS or ACK within the control type."],
                ["To DS", "Set when the frame is destined for the distribution system; explained with the addressing cases."],
                ["From DS", "Set when the frame has come from the distribution system; explained with the addressing cases."],
                ["More flag", "When set to 1, more fragments of this frame follow."],
                ["Retry", "When set to 1, this frame is a retransmission of an earlier frame."],
                ["Pwr mgt", "When set to 1, the station is in power management mode."],
                ["More data", "When set to 1, the station has more data waiting to send."],
                ["WEP", "Wired equivalent privacy; when set to 1, encryption has been applied to the frame."],
                ["Rsvd", "Reserved for future use and ignored by current implementations."],
              ],
            },
            {
              type: "p",
              text: "Several of these subfields exist because the medium itself is unreliable and because power matters. The retry flag exists because a sender that never receives an acknowledgement retransmits, and a receiver that sees the same sequence number twice needs a way to know it is a duplicate rather than new data; the retry bit marks the copy so the duplicate-detection logic can drop it cleanly. The more-fragments flag exists because a long frame is more likely to be corrupted by a burst of interference, so splitting it lets a sender retransmit only the damaged fragment rather than the whole frame. The power-management bit lets a battery-powered station announce that it is about to sleep, so the access point knows to buffer frames addressed to it until it wakes.",
            },
            {
              type: "h3",
              text: "Control frames and the subtype values",
            },
            {
              type: "p",
              text: "Control frames are identified by a type field equal to 01, and the subtype tells which control frame it is. The slides give three values that must be memorised because they appear in every timing diagram of the module: subtype 1011 is request to send, subtype 1100 is clear to send, and subtype 1101 is acknowledgement. These three frames are short, are sent at the base rate so that all stations in the cell can decode them regardless of the data rate currently in use, and are the mechanism by which the handshake and the positive acknowledgement work.",
            },
            {
              type: "note",
              text: "A control frame is deliberately minimal. RTS and CTS carry essentially the duration and the receiver address, and ACK carries essentially nothing but the address of the station being acknowledged. Because they must be understood by every station in the cell, they are kept short and sent at the lowest rate, which is the same reason the timings in the previous section are computed at 1 Mbps.",
            },
          ],
        },
      ],
    },
    {
      id: "s12",
      title: "Addressing Mechanism: The Four Cases",
      body: [
        {
          type: "fig",
          fig: "m09-p25-subfields-in-fc-field",
          caption: "The addressing table: how the To DS and From DS bits select the meaning of address fields 1 through 4.",
        },
        {
          type: "fig",
          fig: "m09-p26-addressing-mechanism-case-1",
          caption: "Addressing case 1: To DS 0, From DS 0, station to station inside one BSS.",
        },
        {
          type: "fig",
          fig: "m09-p27-addressing-mechanism-case-2",
          caption: "Addressing case 2: To DS 0, From DS 1, the frame comes from the distribution system via an access point to a station.",
        },
        {
          type: "fig",
          fig: "m09-p28-addressing-mechanism-case-3",
          caption: "Addressing case 3: To DS 1, From DS 0, the frame goes from a station through an access point into the distribution system.",
        },
        {
          type: "fig",
          fig: "m09-p29-addressing-mechanism-case-4",
          caption: "Addressing case 4: To DS 1, From DS 1, an access point to access point frame over a wireless distribution system.",
        },
        {
          type: "list",
          items: [
            "The header holds **up to four address fields**, and which ones are used depends on the **To DS / From DS** bits.",
            "That gives **four cases**. **To DS=0, From DS=0**: station-to-station inside one BSS.",
            "With the DS involved, the extra fields carry the **final destination** and the **AP's address** — needed because a frame crosses two hops.",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "all four address cases",
          body: [
            {
              type: "p",
              text: "An 802.11 header has room for up to four address fields, and which ones are actually used, and what they mean, is decided by the To DS and From DS bits in the frame control field. The slides present this as the addressing table and then walk through four cases. The four addresses are best understood as roles rather than as fixed positions: address 1 is always the immediate receiver of the frame on this hop, address 2 is always the immediate transmitter, address 3 is the address of the final destination or original source for a frame that must cross the distribution system, and address 4 is needed only when the distribution system itself is wireless and therefore both an intermediate transmitter and an intermediate receiver must be named.",
            },
            {
              type: "p",
              text: "Case one is To DS equal to 0 and From DS equal to 0. The frame is not going to a distribution system and is going from one station in a basic service set to another station in the same basic service set. The destination station appears in address 1 and the source station in address 2, and address 3 carries the basic service set identifier. Because the frame never leaves the cell, no distribution-system address is needed. The acknowledgement for this frame goes back to the original sender, which is the station that transmitted it.",
            },
            {
              type: "p",
              text: "Case two is To DS equal to 0 and From DS equal to 1. The frame is coming from a distribution system, so it has arrived at an access point from the wired backbone and is now being delivered to a station in the cell. The access point is the sending access point and appears in address 2, the station is the destination and appears in address 1, and address 3 carries the original source station's address, since the frame's true origin was some device behind the distribution system. The acknowledgement for this frame is sent back to the access point, because the access point is the immediate transmitter on this hop.",
            },
            {
              type: "p",
              text: "Case three is To DS equal to 1 and From DS equal to 0, and the slides call out its most examinable detail explicitly. The frame is going to a distribution system, travelling from a station to an access point. The receiving access point appears in address 1 because it is the immediate receiver, the original station appears in address 2 because it is the immediate transmitter, and address 3 contains the final destination of the frame, which is the device somewhere beyond the distribution system that the frame is ultimately for. The acknowledgement for this frame is sent back to the original station, not to any device beyond the backbone.",
            },
            {
              type: "p",
              text: "Case four is To DS equal to 1 and From DS equal to 1. Here the distribution system is itself wireless, so a frame travelling between two access points crosses a wireless backbone and must name both the intermediate receiver and the intermediate sender. The receiving access point is in address 1, the sending access point is in address 2, the final destination is in address 3, and the original source is in address 4, which is the only case in which all four address fields are filled.",
            },
            {
              type: "table",
              head: ["To DS", "From DS", "Address 1", "Address 2", "Address 3", "Address 4"],
              rows: [
                ["0", "0", "Destination station", "Source station", "BSS ID", "Not used"],
                ["0", "1", "Destination station", "Sending AP", "Source station", "Not used"],
                ["1", "0", "Receiving AP", "Source station", "Destination station", "Not used"],
                ["1", "1", "Receiving AP", "Sending AP", "Destination station", "Source station"],
              ],
            },
            {
              type: "note",
              text: "A reliable way to remember the table: address 1 is who should hear this transmission next, address 2 is who is speaking, address 3 is the far end of the journey, and address 4 exists only when the middle of the journey is also wireless.",
            },
          ],
        },
      
        {
          type: "viz",
          viz: "wifi-addressing",
        },
      ],
    },
    {
      id: "s13",
      title: "Bluetooth Architecture: Piconets and Scatternets",
      body: [
        {
          type: "fig",
          fig: "m09-p30-bluetooth",
          caption: "Bluetooth as a wireless personal area network, with its architecture, radio layer, baseband layer and upper layers including L2CAP.",
        },
        {
          type: "fig",
          fig: "m09-p31-architecture-two-types-of-networks",
          caption: "The two Bluetooth network types: the single-cell piconet and the combined scatternet.",
        },
        {
          type: "fig",
          fig: "m09-p32-piconet",
          caption: "A piconet: one master, up to seven active slaves, and up to eight more parked slaves.",
        },
        {
          type: "fig",
          fig: "m09-p33-scatternet",
          caption: "A scatternet: piconets overlapping, with a station acting as slave in one and master in another.",
        },
        {
          type: "list",
          items: [
            "Bluetooth is the **wireless PAN** standard; it is organised the same way as 802.11 — architecture, then radio, then baseband.",
            "A **piconet** is one master with up to seven active slaves.",
            "A **scatternet** is several piconets linked together by shared slaves.",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "piconets vs scatternets",
          body: [
            {
              type: "p",
              text: "Bluetooth is the wireless personal area network standard, and the slides organise it the same way they organised 802.11: architecture first, then the radio layer, the baseband layer, and the upper layers including L2CAP. Where an 802.11 cell is built around an access point that is a peer of the stations it serves, a Bluetooth network is built around a master that owns the clock, and that difference in who owns time drives every other design decision in the technology.",
            },
            {
              type: "h3",
              text: "Piconets",
            },
            {
              type: "p",
              text: "The basic Bluetooth network is a piconet. It holds up to eight stations, of which one is the master and the rest are slaves. Slaves synchronise their clocks and their frequency-hopping sequence to the master, so the master defines both the timing and the channel for the whole piconet. There is exactly one master. Communication can be one to one between the master and a single slave, or one to many when the master addresses several slaves in turn. Beyond the eight active stations, a piconet can have up to eight additional slaves in parked state, and the slides are precise about what parked means: a parked slave is synchronised to the master's clock and hopping sequence but cannot communicate, and it must be unparked before it can exchange data.",
            },
            {
              type: "p",
              text: "A scatternet is formed by combining piconets. Because a slave in one piconet may simultaneously be a master in another, or a slave in two piconets at once, the cells overlap and share stations. That shared station must interleave its time between the two piconets, following each master's hopping sequence and clock while it is present in that piconet, which is why the slides describe the scatternet as combined piconets rather than as a single larger network. The scatternet is the Bluetooth answer to extending coverage beyond one cell, in the same way the extended service set is the 802.11 answer, but the mechanism is time-sharing a device rather than joining cells with a wired backbone.",
            },
            {
              type: "table",
              head: ["Property", "Piconet", "Scatternet"],
              rows: [
                ["Definition", "One master with one or more slaves", "Two or more piconets sharing stations"],
                ["Master count", "Exactly one", "One per constituent piconet"],
                ["Active stations", "Up to eight including the master", "Grows with the number of piconets"],
                ["Parked stations", "Up to eight additional slaves", "Per piconet, as above"],
                ["Who owns timing", "The master owns the clock and the hop sequence", "Each master owns its own; shared stations switch between them"],
              ],
            },
            {
              type: "note",
              text: "Exam tip: the number to remember is eight stations per piconet, of which one is the master, so seven active slaves, plus up to eight more parked slaves. A station that belongs to two piconets at once is what makes the combination a scatternet.",
            },
          ],
        },
      ],
    },
    {
      id: "s14",
      title: "Bluetooth Layers: Radio and Baseband",
      body: [
        {
          type: "fig",
          fig: "m09-p34-bluetooth-layers",
          caption: "The Bluetooth layer stack, from the radio layer through the baseband and link manager to L2CAP and the upper layers.",
        },
        {
          type: "fig",
          fig: "m09-p35-radio-layers",
          caption: "The Bluetooth radio layer: 2.4 GHz ISM band, frequency-hopping spread spectrum and GFSK modulation.",
        },
        {
          type: "fig",
          fig: "m09-p36-baseband-layer",
          caption: "The Bluetooth baseband layer: TDMA access with TDD-TDMA half-duplex slot alternation between master and slave.",
        },
        {
          type: "fig",
          fig: "m09-p37-single-slave-communication",
          caption: "Single-slave communication: the master transmits in even slots, the slave in odd slots.",
        },
        {
          type: "fig",
          fig: "m09-p38-multiple-slave-communication",
          caption: "Multiple-slave communication: a slave replies in the next odd slot only when the previous slot was addressed to it.",
        },
        {
          type: "list",
          items: [
            "Bluetooth's **radio layer** ≈ the physical layer: 2.4 GHz ISM band, using **frequency-hopping spread spectrum**.",
            "The **baseband layer** ≈ the MAC sublayer, using **TDMA** — and specifically **TDD**, alternating master and slave slots.",
            "That alternating slot structure is what makes the link symmetric and predictable.",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "TDD and hopping",
          body: [
            {
              type: "p",
              text: "Bluetooth's radio layer is roughly equivalent to the physical layer of the Internet model. It operates in the same 2.4 GHz ISM band as 802.11 and it uses frequency-hopping spread spectrum, so it hops its carrier through the band under the control of the piconet master rather than occupying one channel. Its modulation is a sophisticated version of frequency shift keying called Gaussian frequency shift keying, GFSK, which passes the data through a Gaussian filter before modulating. The filter smooths the transitions between tones, which narrows the occupied spectrum and reduces the interference a Bluetooth radio causes to its neighbours in an already crowded band.",
            },
            {
              type: "p",
              text: "The baseband layer is roughly equivalent to the MAC sublayer in a LAN, and its access method is time division multiple access, TDMA. Specifically it uses time division duplexing TDMA, TDD-TDMA, which is a form of half-duplex communication: the medium is divided into slots, and a station either transmits or receives in a given slot but never both. The slides give the slot discipline for the two cases. In single-slave communication the master uses the even-numbered slots and the slave uses the odd-numbered slots, so the two directions alternate cleanly. In multiple-slave communication the master still uses even slots, and a slave sends in the next odd-numbered slot only if the packet in the previous slot was addressed to that slave, which is how one master serves several slaves without any of them colliding.",
            },
            {
              type: "p",
              text: "The slot period is the heartbeat of the whole scheme, and it is worth committing to memory alongside the addressing rules. Bluetooth slots are 625 microseconds long, and a frame may occupy one, three or five slots. A station therefore transmits in bursts whose lengths are odd multiples of the slot period, and every station in the piconet must keep the same slot boundary because the master's clock defines it.",
            },
            {
              type: "example",
              text: "Work out how long a Bluetooth frame lasts if it occupies one, three or five slots, and how many frames per second a master could send if it used only single-slot frames on its own even slots.",
              steps: [
                "One Bluetooth slot lasts 625 microseconds, so 1 slot = 625 us, 3 slots = 1875 us, 5 slots = 3125 us.",
                "In TDD-TDMA the master and slaves alternate, so a single-slot frame followed by its reply occupies 2 slots = 1250 us.",
                "A full master-slave round therefore repeats every 1250 us, which is 1 / 1250 us = 800 rounds per second.",
                "So a single-slot exchange supports up to 800 master frames per second and 800 slave replies, before any multi-slot frame is used.",
                "A five-slot frame consumes 3125 us on its own, so it lowers the frame rate to 320 frames per second for that length.",
              ],
            },
            {
              type: "note",
              text: "The choice of one, three or five slots is a straight trade between overhead and efficiency: a longer frame carries more payload per header, but it also occupies the medium for longer and therefore delays every other station in the piconet.",
            },
          ],
        },
      ],
    },
    {
      id: "s15",
      title: "Physical Links: SCO and ACL, and L2CAP",
      body: [
        {
          type: "fig",
          fig: "m09-p39-physical-links",
          caption: "Bluetooth physical links: SCO for synchronous, latency-sensitive traffic and ACL for asynchronous, integrity-sensitive traffic.",
        },
        {
          type: "fig",
          fig: "m09-p40-frame-format-types",
          caption: "Bluetooth frame format types at the baseband.",
        },
        {
          type: "fig",
          fig: "m09-p41-l2cap-data-packet-format",
          caption: "The L2CAP data packet format: length and channel identifier fields ahead of the payload.",
        },
        {
          type: "list",
          items: [
            "Two link types: **SCO** (synchronous, connection-oriented) and **ACL** (asynchronous, connectionless).",
            "**SCO** protects **latency** — good for voice, where a late packet is useless. Fixed slots, no retransmission.",
            "**ACL** protects **integrity** — good for data, where a damaged packet is retransmitted.",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "SCO vs ACL",
          body: [
            {
              type: "p",
              text: "Bluetooth defines two link types, and the slides characterise them by what they are willing to sacrifice. SCO, the synchronous connection oriented link, treats latency as more important than integrity: it is used for real-time traffic such as voice, and a damaged packet is never retransmitted, because retransmitting it would arrive too late to be played and would only add delay to the packets behind it. ACL, the asynchronous connectionless link, makes the opposite trade: data integrity is more important than avoiding latency, so if a packet is damaged it is retransmitted, however long that takes. The two links can coexist in one piconet, and a station that is carrying voice and a file transfer at the same time will use SCO for one and ACL for the other.",
            },
            {
              type: "table",
              head: ["Link type", "Full name", "Priority", "On a damaged packet", "Typical use"],
              rows: [
                ["SCO", "Synchronous connection oriented", "Avoiding latency", "Never retransmitted", "Voice and other real-time streams"],
                ["ACL", "Asynchronous connectionless", "Data integrity", "Retransmitted", "File transfer and other data"],
              ],
            },
            {
              type: "p",
              text: "Above the baseband sits L2CAP, the logical link control and adaptation protocol, which the slides describe as roughly equivalent to the logical link control sublayer in a LAN. L2CAP is used for data exchange on an ACL link and its specific duties are multiplexing, segmentation and reassembly, quality of service, and group management. Multiplexing lets several higher-layer protocols or applications share one ACL connection by tagging each unit of data with the channel it belongs to. Segmentation and reassembly break a large packet from the upper layer into pieces small enough for the baseband frames and put them back together at the far end, which is necessary because the baseband frame size is fixed and small. Quality of service lets a flow negotiate the treatment it needs. Group management supports sending one unit of data to several recipients.",
            },
            {
              type: "p",
              text: "The L2CAP packet format reflects its duties directly. A length field tells the receiver how many bytes of payload follow, which is what allows reassembly, and a channel identifier field names which logical channel the payload belongs to, which is what allows multiplexing. The payload that follows is whatever the higher layer produced. Because L2CAP sits above the baseband and above the link manager, it can be used by upper-layer protocols without those protocols needing to know anything about slots, hopping or piconet membership.",
            },
            {
              type: "note",
              text: "A compact way to hold the whole Bluetooth stack in mind: the radio layer moves symbols through a hopping channel, the baseband turns those into slotted frames under TDD-TDMA, the link manager sets up and tears down the SCO and ACL links, and L2CAP multiplexes, segments and reassembles so that the layers above see a normal reliable data pipe.",
            },
          ],
        },
      ],
    },
    {
      id: "s16",
      title: "Putting It Together: From Wired Assumptions to Wireless Reality",
      body: [
        {
          type: "list",
          items: [
            "Ethernet assumed three things a cable makes true: you can **hear** everyone, **collisions are detectable**, and the medium is **private**.",
            "Wireless breaks all three — and every mechanism in this module is a response to one broken assumption.",
            "That is the cleanest way to revise the module: name the broken assumption, then name the mechanism that compensates.",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "the three assumptions",
          body: [
            {
              type: "p",
              text: "This module's real subject is what changes when the data link layer stops being able to hear the medium. Ethernet was designed on three assumptions that a shared cable makes true: every station hears every other station, a station can compare what it sent with what it hears and therefore detect a collision directly, and the round-trip time is short enough that a collision is noticed before the frame has finished transmitting. A radio medium breaks all three. Stations have different ranges, so the set of stations that can hear each other is not the same for every pair; a station cannot listen while it transmits without an expensive duplexer; and the hidden terminal means two stations can transmit simultaneously into the same receiver with neither one aware.",
            },
            {
              type: "p",
              text: "Every mechanism in the middle of this module is a response to one of those broken assumptions, and this is the cleanest way to revise the whole thing. The acknowledgement exists because the sender can no longer detect a collision, so it needs positive confirmation that the frame arrived. The RTS/CTS handshake exists because carrier sensing gives a station incomplete information, so the reservation is announced from the receiver's side to reach exactly the stations the sender could not reach. SIFS and DIFS exist because once exchanges are protected by a handshake, the protocol needs a way to let a station that is mid-exchange hold the medium against a station that wants to start a new one. The NAV exists because the duration is known in advance and can therefore be broadcast as a promise that everyone can obey without further signalling.",
            },
            {
              type: "h3",
              text: "The same ideas in the wide-area data link protocols",
            },
            {
              type: "p",
              text: "The framing and error-recovery machinery that wide-area data link protocols such as HDLC and PPP use is the same family of ideas, applied where the medium is a point-to-point leased line rather than a shared radio channel. A point-to-point link has no contention problem at all, because exactly two devices are on it, so the whole access-arbitration apparatus of this module disappears. What remains is framing and recovery: a flag sequence that marks the start and end of every frame, a mechanism to make sure the flag pattern never appears inside the data, a frame check sequence to detect corruption, and sequence numbers so that a lost frame can be retransmitted. Where CSMA/CA protects a shared medium by preventing collisions, a wide-area data link protocol protects a point-to-point link by detecting corruption and recovering from it.",
            },
            {
              type: "table",
              head: ["Concern", "Shared wireless LAN (802.11)", "Point-to-point wide-area link"],
              rows: [
                ["Who may transmit", "Contested; CSMA/CA, backoff and RTS/CTS", "Only two devices exist, so no contention"],
                ["Frame delimiting", "Frame control field and duration field", "Flag sequence at each end of the frame"],
                ["Transparency", "Subtype and address fields give meaning to each header", "Bit stuffing so the flag cannot occur in the data"],
                ["Corruption", "Positive acknowledgement, retry bit, retransmission", "Frame check sequence plus sequence numbers and retransmission"],
                ["Flow control", "Implicit, through the acknowledgement and window behaviour", "Explicit sliding window of outstanding frames"],
              ],
            },
            {
              type: "p",
              text: "That is the bridge into the wide-area material. A wireless LAN spends most of its link-layer complexity deciding who talks, because many stations share one medium and cannot hear each other reliably. A wide-area point-to-point link spends almost none of its complexity on that question and devotes nearly all of it to framing, transparency, error detection and recovery, because the medium is private and the only enemy is noise.",
            },
            {
              type: "note",
              text: "Exam tip: if a question asks why a wireless LAN needs collision avoidance while a wired LAN uses collision detection, the answer to give is the three reasons from the slides, in order: half-duplex radio makes simultaneous send and receive costly, a hidden terminal means a collision may be inaudible to the sender, and distance fading can weaken a colliding signal below the threshold at which it is recognised.",
            },
          ],
        },
      ],
    },
  ],
  flashcards: [
    { q: "Which IEEE 802 working group defines wireless LANs, and which defines broadband wireless access?",
      a: "802.11 defines wireless LANs, marketed as Wi-Fi; 802.16 defines broadband wireless access, marketed as WiMAX.", sec: "s1" },
    { q: "What are the four topics the module's introduction lists for the wireless LAN?",
      a: "Architecture, physical layer, MAC layer, and the addressing mechanism.", sec: "s2" },
    { q: "What is a basic service set, and what changes when it contains an access point?",
      a: "A BSS is a cell of stationary or mobile wireless stations. With an access point it can relay traffic outside the cell; without one it is stand-alone and cannot send data to other BSSs.", sec: "s3" },
    { q: "What is an extended service set?",
      a: "Two or more basic service sets with access points, connected through a distribution system, which is usually a wired LAN.", sec: "s3" },
    { q: "Distinguish no-transition, BSS-transition and ESS-transition mobility.",
      a: "No transition: stationary or moving only inside one BSS. BSS transition: moving between BSSs within one ESS. ESS transition: moving from one ESS to another.", sec: "s4" },
    { q: "How does FHSS make interception and interference harder?",
      a: "The carrier dwells briefly on one frequency, hops to another for the same time, and repeats the cycle, so a listener must know the pseudo-random hopping sequence to follow it and a narrowband interferer spoils only the hops landing on it.", sec: "s5" },
    { q: "Give the FHSS numbers: band, subbands, modulation and data rates.",
      a: "2.4 GHz ISM band (about 2.4 to 2.4835 GHz), 79 subbands of 1 MHz each, FSK modulation with two or four levels giving 1 or 2 Mbps.", sec: "s5" },
    { q: "What does DSSS do to each data bit, and what modulation does it use?",
      a: "It replaces each bit with a chip code, spreading the signal over a wider band; it uses PSK, either BPSK or QPSK, in the 2.4 GHz band.", sec: "s5" },
    { q: "Why does the slide note call multipath fading the main issue for FHSS, and how does hopping help?",
      a: "Reflected copies arrive at different times and add constructively or destructively. Because the copies land on different frequencies, a deep fade on one subband costs only the frames sent during that hop.", sec: "s6" },
    { q: "What are the limits of the 802.11 infrared physical layer?",
      a: "1 or 2 Mbps, a range of 10 to 20 metres, cannot penetrate walls, and does not work outdoors.", sec: "s6" },
    { q: "How many subcarriers does 802.11a use, and how are they divided?",
      a: "52 subcarriers: 48 carry data and 4 carry control information such as pilots.", sec: "s7" },
    { q: "What modulation reaches 18 Mbps and what reaches 54 Mbps in 802.11a?",
      a: "PSK gives 18 Mbps and QAM gives 54 Mbps in the 5 GHz OFDM scheme.", sec: "s7" },
    { q: "What is CCK and which amendment uses it?",
      a: "Complementary code keying, used by 802.11b HR-DSSS, encodes 4 or 8 bits into one CCK symbol and gives the rates 1, 2, 5.5 and 11 Mbps.", sec: "s7" },
    { q: "Which two 802.11 amendments are incompatible, and which one is backward compatible with 802.11b?",
      a: "802.11b (2.4 GHz) and 802.11a (5 GHz) are incompatible. 802.11g is backward compatible with 802.11b.", sec: "s7" },
    { q: "Name the two coordination functions of the 802.11 MAC and say which is mandatory.",
      a: "The distributed coordination function (DCF), which is mandatory and contention-based, and the point coordination function (PCF), which is optional and contention-free.", sec: "s8" },
    { q: "Give the three reasons the slides give for why WANs cannot implement CSMA/CD.",
      a: "Collision detection requires sending and receiving at the same time, which is costly; a collision may not be detected because of a hidden terminal; and distance can cause fading that prevents a station hearing a collision.", sec: "s8" },
    { q: "What is the hidden station problem?",
      a: "Two stations that cannot hear each other both sense the medium as idle and transmit to the same receiver, so their frames collide at the receiver while neither sender can detect the collision.", sec: "s9" },
    { q: "What is the exposed station problem?",
      a: "A station defers because it hears a neighbour transmitting, even though its own receiver lies in another direction and its transmission would not have collided.", sec: "s9" },
    { q: "How does the RTS/CTS handshake solve the hidden station problem?",
      a: "The CTS is heard by stations in range of the receiver, including the hidden station, and both frames carry a duration that listeners record in their NAV as a promise to stay off the medium.", sec: "s9" },
    { q: "How do SIFS and DIFS differ, and why does the ordering matter?",
      a: "SIFS is the shortest interframe space, granted to a station continuing an existing exchange; DIFS is the longer gap a station observes before starting a new contention. Because SIFS is shorter, a station mid-exchange keeps the medium.", sec: "s10" },
    { q: "Where in a CSMA/CA exchange can a collision occur, according to the slide note?",
      a: "Only during the handshake period, the RTS and CTS exchange, because afterwards every station in range has heard the duration and set its NAV.", sec: "s10" },
    { q: "What is the network allocation vector?",
      a: "A local countdown each station keeps from the duration field of an overheard RTS or CTS, acting as virtual carrier sense so the station treats the medium as busy until it expires.", sec: "s10" },
    { q: "What are the type values for management, control and data frames in the 802.11 FC field?",
      a: "Management is 00, control is 01, and data is 10; the current version subfield value is 0.", sec: "s11" },
    { q: "Give the control-frame subtype values for RTS, CTS and ACK.",
      a: "Request to send is 1011, clear to send is 1100, and acknowledgement is 1101, all under control type 01.", sec: "s11" },
    { q: "What does the retry subfield in the FC field mean, and why does it exist?",
      a: "When set to 1 the frame is a retransmission. It lets a receiver recognise a duplicate by its sequence number rather than treating the copy as new data.", sec: "s11" },
    { q: "In addressing case 1, what do the To DS and From DS bits say and what are the addresses?",
      a: "To DS = 0 and From DS = 0: the frame goes from one station in a BSS to another in the same BSS, with destination in address 1, source in address 2 and the BSS ID in address 3; the ACK goes to the original sender.", sec: "s12" },
    { q: "In addressing case 3, what does address 3 contain?",
      a: "To DS = 1 and From DS = 0, a station sending to an access point; address 3 contains the final destination of the frame, and the ACK goes back to the original station.", sec: "s12" },
    { q: "When are all four address fields of an 802.11 header used?",
      a: "In case 4, To DS = 1 and From DS = 1, when the distribution system is itself wireless and a frame travels from one access point to another.", sec: "s12" },
    { q: "How many stations can a piconet hold, and what is a parked slave?",
      a: "Up to eight stations with one master, plus up to eight additional slaves in parked state, which are synchronised but cannot communicate.", sec: "s13" },
    { q: "What makes a scatternet, and can one station belong to two piconets?",
      a: "A scatternet is combined piconets; a slave in one piconet can be a master in another, so stations are shared between the overlapping cells.", sec: "s13" },
    { q: "What band, spreading and modulation does the Bluetooth radio layer use?",
      a: "The 2.4 GHz ISM band, frequency-hopping spread spectrum, and GFSK, a version of FSK with Gaussian bandwidth filtering.", sec: "s14" },
    { q: "How does TDD-TDMA slot assignment work in single-slave and multiple-slave communication?",
      a: "The master uses even-numbered slots. In single-slave mode the slave uses odd-numbered slots; in multiple-slave mode a slave sends in the next odd slot only if the previous slot was addressed to it.", sec: "s14" },
    { q: "How long is a Bluetooth slot, and how many slots can a frame occupy?",
      a: "A slot is 625 microseconds and a frame can occupy one, three or five slots.", sec: "s14" },
    { q: "Contrast SCO and ACL links.",
      a: "SCO is synchronous connection oriented: latency matters more than integrity, so a damaged packet is never retransmitted. ACL is asynchronous connectionless: integrity matters more than latency, so a damaged packet is retransmitted.", sec: "s15" },
    { q: "What are L2CAP's four duties?",
      a: "Multiplexing, segmentation and reassembly, quality of service, and group management, used for data exchange on an ACL link.", sec: "s15" },
    { q: "What do the length and channel identifier fields in an L2CAP packet accomplish?",
      a: "The length field tells the receiver how many payload bytes follow, enabling reassembly; the channel identifier names the logical channel, enabling multiplexing.", sec: "s15" },
    { q: "Why does a wide-area point-to-point link need no medium-access arbitration?",
      a: "Exactly two devices share the link, so there is no contention; the link layer's complexity goes into framing, transparency, error detection and recovery instead.", sec: "s16" },
  ],
  quiz: [
    { q: "Which IEEE working group is the wireless LAN standard commonly known as Wi-Fi?",
      choices: ["802.1", "802.3", "802.11", "802.16"],
      answer: 2,
      why: "The slides name Wi-Fi as 802.11 and WiMAX as 802.16; 802.3 is Ethernet and 802.1 covers bridging and VLANs.", sec: "s1" },
    { q: "A basic service set that contains no access point can best be described as:",
      choices: ["an extended service set", "stand-alone, unable to send data to other BSSs", "a distribution system", "a scatternet"],
      answer: 1,
      why: "The slides state that a BSS without an AP is stand-alone and cannot send data to other BSSs; only an AP plus a distribution system joins cells.", sec: "s3" },
    { q: "A station moves from one basic service set to another within the same extended service set. Which mobility class is this?",
      choices: ["No-transition mobility", "BSS-transition mobility", "ESS-transition mobility", "None of these classes"],
      answer: 1,
      why: "BSS-transition mobility is movement from one BSS to another confined to a single ESS; ESS-transition mobility would require crossing into a different ESS.", sec: "s4" },
    { q: "The FHSS physical layer in the slides uses the 2.4 GHz ISM band divided into how many subbands?",
      choices: ["13 subbands of 5 MHz", "48 subbands of 1 MHz", "52 subbands of 1 MHz", "79 subbands of 1 MHz"],
      answer: 3,
      why: "The slides give 79 subbands of 1 MHz each in the low end of the 2.4 GHz ISM band, with FSK giving 1 or 2 Mbps.", sec: "s5" },
    { q: "Which statement about 802.11a is correct?",
      choices: ["It uses the 2.4 GHz band and is backward compatible with 802.11b", "It uses the 5 GHz band with OFDM and 48 data subcarriers", "It uses HR-DSSS with CCK in the 5 GHz band", "It is an infrared physical layer"],
      answer: 1,
      why: "802.11a uses OFDM in the 5 GHz ISM band with 48 data subcarriers and 4 control subcarriers, reaching 54 Mbps with QAM.", sec: "s7" },
    { q: "Which amendment is backward compatible with 802.11b?",
      choices: ["802.11a", "802.11g", "802.11 FHSS", "None of them"],
      answer: 1,
      why: "The slides state 802.11g uses OFDM in the 2.4 GHz band at 54 Mbps and is backward compatible with 802.11b, while 802.11a and 802.11b are incompatible.", sec: "s7" },
    { q: "Which of these is NOT one of the three reasons the slides give for why a WAN cannot implement CSMA/CD?",
      choices: ["Collision detection requires sending and receiving at the same time", "A hidden terminal may prevent a station from detecting a collision", "Distance can cause fading that hides a collision", "The medium is too fast for carrier sensing"],
      answer: 3,
      why: "The slides cite half-duplex send and receive cost, the hidden terminal, and distance fading. Medium speed is not among the three stated reasons.", sec: "s8" },
    { q: "In the hidden station problem, why does the collision go undetected by the senders?",
      choices: ["The frames are too short to overlap", "Each sender is out of range of the other, so neither hears the collision at the receiver", "The access point discards the frames before collision", "The NAV suppresses detection"],
      answer: 1,
      why: "The two senders cannot hear each other, so each senses the medium as idle and transmits; the signals collide at the receiver, invisible to both senders.", sec: "s9" },
    { q: "According to the slide note, during which part of a CSMA/CA exchange can a collision occur?",
      choices: ["Only during the handshake period of RTS and CTS", "Throughout the data transmission", "Only during the acknowledgement", "Never, because CSMA/CA eliminates collisions"],
      answer: 0,
      why: "The slide note says collision only occurs during the handshake period, because after the RTS/CTS exchange every station in range has the duration and sets its NAV.", sec: "s10" },
    { q: "Which field of the 802.11 frame control field, per the slides, is set when a station is in power management mode?",
      choices: ["More flag", "Retry", "Pwr mgt", "WEP"],
      answer: 2,
      why: "The slides define Pwr mgt as set to 1 when the station is in power management mode; Retry marks a retransmission and WEP marks encryption.", sec: "s11" },
    { q: "Which control-frame subtype value corresponds to clear to send?",
      choices: ["1011", "1100", "1101", "0110"],
      answer: 1,
      why: "The slides give RTS as 1011, CTS as 1100 and ACK as 1101, all under the control type value 01.", sec: "s11" },
    { q: "In addressing case 2, To DS = 0 and From DS = 1, which device is addressed in address 1?",
      choices: ["The access point", "The distribution system", "The destination station", "The original source station"],
      answer: 2,
      why: "In case 2 the frame comes from the distribution system to a station, so address 1 is the destination station, address 2 is the sending AP and address 3 is the original source.", sec: "s12" },
    { q: "How many address fields are used when To DS = 1 and From DS = 1, and why?",
      choices: ["Two, because the DS is wireless so only the endpoints matter", "Three, because the BSS ID replaces the fourth", "All four, because the distribution system is itself wireless", "None, because the frame is broadcast"],
      answer: 2,
      why: "Case 4 applies when the distribution system is wireless, so both the intermediate transmitter and receiver must be named alongside the final destination and original source.", sec: "s12" },
    { q: "In a piconet, how many stations can be active and how many additional slaves may be parked?",
      choices: ["Eight active, no parked slaves", "Seven active plus eight parked", "Eight active including the master, plus up to eight parked", "Sixteen active slaves"],
      answer: 2,
      why: "The slides say up to eight stations of which one is the master, plus up to eight additional slaves in parked state that are synchronised but cannot communicate.", sec: "s13" },
    { q: "In Bluetooth multiple-slave communication, when may a slave transmit?",
      choices: ["In any odd-numbered slot it chooses", "In the next odd-numbered slot only if the previous slot was addressed to it", "Only in even-numbered slots", "Whenever the master is silent"],
      answer: 1,
      why: "The master uses even slots; a slave sends in the next odd slot only if the packet in the previous slot was addressed to it, which prevents slave collisions.", sec: "s14" },
    { q: "Which Bluetooth link type retransmits a damaged packet?",
      choices: ["SCO, because latency matters more than integrity", "ACL, because data integrity matters more than latency", "Both SCO and ACL", "Neither, since the baseband suppresses retransmission"],
      answer: 1,
      why: "ACL is the asynchronous connectionless link, where integrity outranks latency so damaged packets are retransmitted; SCO never retransmits a damaged packet.", sec: "s15" },
    { q: "Which set describes L2CAP's duties in the slides?",
      choices: ["Encryption, authentication and key management", "Multiplexing, segmentation and reassembly, QoS, and group management", "Frequency hopping, slot timing and power control", "Routing, addressing and fragmentation at layer 3"],
      answer: 1,
      why: "L2CAP is used for data exchange on an ACL link and its listed duties are multiplexing, segmentation and reassembly, quality of service and group management.", sec: "s15" },
    { q: "Why does a point-to-point wide-area data link not need medium-access arbitration?",
      choices: ["Because it uses CSMA/CA with a very long DIFS", "Because only two devices share the link, so there is no contention", "Because the flag sequence prevents collisions", "Because acknowledgements are never used"],
      answer: 1,
      why: "With exactly two devices on the link there is no contention to arbitrate; the link layer's work is framing, transparency, error detection and recovery instead.", sec: "s16" },
  ],
});
