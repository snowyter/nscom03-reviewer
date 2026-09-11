window.NSCOM_MODULES = window.NSCOM_MODULES || [];
window.NSCOM_MODULES.push({
  id: "m07",
  num: 7,
  title: "Media Access Control",
  accent: "#c792ea",
  icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3.2"/><circle cx="4" cy="6" r="2"/><circle cx="20" cy="6" r="2"/><circle cx="4" cy="18" r="2"/><circle cx="20" cy="18" r="2"/><path d="M6.1 7.2 9.7 10.3M17.9 7.2 14.3 10.3M6.1 16.8 9.7 13.7M17.9 16.8 14.3 13.7"/><path d="M2.6 6h1.2M20.2 6h1.2M2.6 18h1.2M20.2 18h1.2"/></svg>`,
  summary:
    "When several stations share one link, somebody has to decide who may speak and when. This module covers the MAC sublayer's three families of answer — random access (ALOHA, CSMA, CSMA/CD, CSMA/CA) with their vulnerable-time and throughput derivations, controlled access (reservation, polling, token passing), and channelization (FDMA, TDMA, CDMA with orthogonal Walsh chips).",
  sections: [
    {
      id: "s1",
      title: "The Multi-Point Link Problem and the MAC Sublayer",
      body: [
        {
          type: "list",
          items: [
            `A **point-to-point** link has two devices, so "who talks next" never arises. A **multi-point** link does not.`,
            "The moment a channel is shared, stations can **collide** — and no amount of framing or error control solves that.",
            "**Media access control** is the sublayer that decides who may transmit. It is the rules of speaking in a meeting.",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "why point-to-point differs",
          body: [
            {
              type: "p",
              text: `A point-to-point link connects exactly two devices, so the question of "who transmits next" never arises: the only two candidates are the endpoints, and the direction of the traffic is already decided by the sender. A multi-point link is different. Here three, ten, or a thousand nodes are wired — or are within radio range of — one shared channel, and the link is consequently called a multi-point link or a broadcast link, because any transmission propagates to every attached station.`,
            },
            {
              type: "p",
              text: "The moment the channel is shared, a coordination problem appears that has nothing to do with framing, error control, or flow control. If station A and station C both begin modulating the medium at the same instant, their waveforms add algebraically. The receiver sees a garbled superposition in which neither frame survives, both transmissions are wasted, and — if the protocol has no recovery rule — both stations may retry immediately and collide again. Controlling access to the medium is therefore the central new problem introduced by broadcast links.",
            },
            {
              type: "p",
              text: "The lecture frames this exactly as the rules of speaking in an assembly. In a well-run meeting, procedures guarantee that the right to speak is upheld, that two people do not speak at the same time, that speakers do not interrupt one another, and that no single person monopolizes the discussion. A medium access protocol must deliver the same four properties on an electronic channel: legitimate access, no simultaneous transmission, no destruction of an ongoing transmission, and no capture of the channel by one greedy node.",
            },
            {
              type: "p",
              text: "The protocols that implement those rules belong to a sublayer of the data-link layer called media access control, abbreviated MAC. The name is used in two senses that are worth separating. Broadly, it names the whole sublayer with its function of deciding who gets the medium. Narrowly, it names the header that carries physical addresses and the framing fields used by LANs. This module is about the broad sense: the access algorithms themselves.",
            },
            {
              type: "h3",
              text: "Where MAC sits and what it does not do",
            },
            {
              type: "list",
              items: [
                "MAC is a sublayer of the data link layer, sitting logically between the logical link control (LLC) sublayer above it and the physical layer below it.",
                "It decides who transmits on the shared medium and when; it does not chase lost frames end-to-end, which is the transport layer's job.",
                "It frames data and detects errors, which is a data-link service shared with LLC, but it adds the access decision on top.",
                "It may generate its own control frames (RTS, CTS, ACK, token) that carry no user payload at all.",
              ],
            },
            {
              type: "p",
              text: "A useful mental model is that MAC answers a scheduling question rather than a data question. Given N stations that each have an unpredictable demand for the channel, which station transmits in the next instant? Three families of answer exist, and every protocol in this module is an instance of one of them. Random access lets stations contend for the channel with no central authority. Controlled access makes stations consult one another or a master before transmitting. Channelization partitions the channel's capacity itself into reserved slices — frequency bands, time slots, or codes.",
            },
            {
              type: "table",
              head: ["Family", "Who decides", "Representative protocols", "Collision possible?"],
              rows: [
                ["Random access", "The stations themselves, by a contention rule", "ALOHA, CSMA, CSMA/CD, CSMA/CA", "Yes, by design"],
                ["Controlled access", "A master station or a circulating token", "Reservation, polling, token passing", "No, access is authorized"],
                ["Channelization", "A pre-arranged partition of capacity", "FDMA, TDMA, CDMA", "No, each station has its own slice"],
              ],
            },
            {
              type: "note",
              text: "Exam framing: the three families are not ranked by quality. They are ranked by assumptions. Contention is cheap when traffic is bursty and the load is light; controlled access is stable when the load is heavy and stations are few; channelization is best when traffic is continuous and predictable.",
            },
          ],
        },
      ],
    },
    {
      id: "s2",
      title: "Random Access: Contention as a Design Principle",
      body: [
        {
          type: "list",
          items: [
            "**Random access (contention)**: no station is superior, no master, no token, no reserved slot.",
            "Every station may transmit whenever it wants — hence *random* — and rules only cover what to do about collisions.",
            "The payoff is simplicity under light load; the cost is throughput collapse under heavy load.",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "the five procedures",
          body: [
            {
              type: "p",
              text: "In random-access or contention methods, no station is superior to another station and none is assigned control over another. There is no master, no token, no reservation slot, and no pre-allocated band. Every station is equal in the eyes of the protocol, and a station that has data to send uses a procedure defined by the protocol to make its own decision about whether or not to send.",
            },
            {
              type: "p",
              text: "There is no scheduled time for a station to transmit — hence random transmission, and hence the name random access. Equally, no rules specify which station should send next. The right to transmit is won rather than granted, which is why the family is also called the contention method. The price of this democracy is that two or more stations may make the same decision at the same time, and the result is an access conflict, a collision, in which the frames involved are destroyed or modified.",
            },
            {
              type: "h3",
              text: "The five procedures every random-access protocol spells out",
            },
            {
              type: "list",
              items: [
                "How a station decides that it is allowed to send — for example, by sensing the carrier first, or by not sensing at all.",
                "How a station knows whether its transmission succeeded — by an explicit acknowledgment, or by the absence of a detected collision.",
                "What a station does after a collision — wait a random backoff, wait a fixed time, or abort.",
                "How the protocol handles heavy load, since a purely greedy rule can drive the channel into permanent collision.",
                "Whether the procedure is stable, meaning that offered load near capacity still yields useful throughput.",
              ],
            },
            {
              type: "p",
              text: "The last point is the one students underrate. A protocol can be correct and still be useless: pure ALOHA is a legitimate random-access protocol, yet it can never convert more than about 18.4 percent of the raw channel into delivered traffic. The remainder of this module derives that number and shows how each successive protocol recovers part of the loss.",
            },
            {
              type: "p",
              text: "It helps to fix vocabulary before comparing protocols. Offered load G is the average number of frame transmissions attempted per frame time, counting both new frames and retransmissions; a G of 1.0 means the stations, taken together, are attempting one frame's worth of traffic per frame duration. Throughput S is the average number of successfully delivered frames per frame time, so S never exceeds 1.0 and is bounded above by G. When S equals 1.0, the channel carries a fully packed stream of useful frames and nothing is wasted.",
            },
          ],
        },
      ],
    },
    {
      id: "s3",
      title: "ALOHA: Pure and Slotted, with the Vulnerable-Time Derivation",
      body: [
        {
          type: "fig",
          fig: "m07-p07-aloha",
        },
        {
          type: "fig",
          fig: "m07-p08-frames-in-aloha-network",
        },
        {
          type: "fig",
          fig: "m07-p09-procedure-for-pure-aloha",
        },
        {
          type: "fig",
          fig: "m07-p10-frames-in-slotted-aloha",
        },
        {
          type: "fig",
          fig: "m07-p11-vulnerable-time-in-slotted-aloha",
        },
        {
          type: "list",
          items: [
            "**ALOHA** is the earliest random-access method (University of Hawaii, early 1970s) — transmit and hope.",
            "**Pure ALOHA**: send immediately; max throughput only **18.4%**. **Slotted ALOHA**: send only at slot boundaries; doubles it to **36.8%**.",
            "The gain comes from halving the **vulnerable time** — the window in which another frame can collide with yours.",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "the 18.4% derivation",
          body: [
            {
              type: "p",
              text: "ALOHA is the earliest random-access method, developed at the University of Hawaii in the early 1970s. It was designed for a radio (wireless) LAN, as the name suggests, but nothing in the algorithm depends on radio: it can be used on any shared medium. The original premise was deliberately simple. If a station has a frame to send, it sends it. It does not listen first, it does not wait for a turn, and it does not ask permission from anyone.",
            },
            {
              type: "h3",
              text: "The collision window: why the vulnerable time is two frame times",
            },
            {
              type: "p",
              text: "Because a station transmits blindly, station A's frame can be ruined by any other station that begins transmitting during a window that extends from one full frame time before A's first bit to one full frame time after A's first bit. Suppose every frame takes Tfr seconds on the wire. If station B starts its frame up to Tfr before A does, B's tail is still on the medium when A starts, and the two overlap. If station C starts up to Tfr after A does, A's tail is still on the medium when C starts, and the two overlap. The interval during which a competitor's start causes destruction is therefore the open window of length 2 × Tfr centred on A's start.",
            },
            {
              type: "p",
              text: "This 2 × Tfr window is the vulnerable time of pure ALOHA: the length of time in which no other station may begin transmitting if A's frame is to survive. It is twice a frame time, not one frame time, because A itself was too polite-free to check anything — the harm can come from either side of its transmission.",
            },
            {
              type: "formula",
              tex: "T_{\\text{vuln}}^{\\text{pure}} = 2 \\times T_{fr}",
              text: "Pure ALOHA: the vulnerable time is two frame times, because a frame can be destroyed by a competitor starting anywhere from one frame time before to one frame time after its own start.",
            },
            {
              type: "p",
              text: "Now assume the aggregate attempts arrive as a Poisson process and let G be the offered load in frames per frame time. The probability that no other station begins a frame during A's vulnerable window of length 2 × Tfr is exp(−2G). Multiplying by G to convert that probability into delivered frames per frame time gives the pure-ALOHA throughput. Differentiating with respect to G and setting the derivative to zero shows the expression peaks at G = 0.5, where S takes the value 1/(2e).",
            },
            {
              type: "formula",
              tex: "S_{\\text{pure}} = G \\, e^{-2G}, \\qquad \\max S = \\frac{1}{2e} \\approx 0.184 \\text{ at } G = 0.5",
              text: "Pure ALOHA carries at most about 18.4 percent of the channel's capacity, reached when the stations together offer half a frame of new traffic per frame time — the other half of the offered load is wasted on collisions.",
            },
            {
              type: "h3",
              text: "Slotted ALOHA halves the window",
            },
            {
              type: "p",
              text: "Slotted ALOHA repairs half the damage by imposing a clock. Time is divided into intervals whose length equals one frame time, and a station may begin transmitting only at the beginning of a slot. Frames therefore either overlap completely or not at all — partial overlap is impossible. That single restriction cuts the vulnerable time in half, from 2 × Tfr to 1 × Tfr, because a competitor can no longer start a frame one frame time before A and catch A's beginning; the earliest it can start is the boundary of A's own slot.",
            },
            {
              type: "formula",
              tex: "T_{\\text{vuln}}^{\\text{slotted}} = 1 \\times T_{fr}",
              text: "Slotted ALOHA: the vulnerable time is one frame time, because transmissions can only start on slot boundaries, so a frame can be ruined only by another frame in the same slot.",
            },
            {
              type: "formula",
              tex: "S_{\\text{slotted}} = G \\, e^{-G}, \\qquad \\max S = \\frac{1}{e} \\approx 0.368 \\text{ at } G = 1",
              text: "Slotted ALOHA carries at most about 36.8 percent of the channel's capacity — exactly double pure ALOHA's ceiling — reached when the offered load is one full frame per frame time.",
            },
            {
              type: "example",
              text: "Compare the two ALOHA variants at the offered load that maximizes pure ALOHA, G = 0.5, and then at the load that maximizes slotted ALOHA, G = 1.0.",
              steps: [
                "At G = 0.5: pure gives S = 0.5 × e^(−1) = 0.5 × 0.3679 = 0.1839, i.e. 18.4 percent of capacity.",
                "At G = 0.5: slotted gives S = 0.5 × e^(−0.5) = 0.5 × 0.6065 = 0.3033, i.e. 30.3 percent.",
                "At G = 1.0: pure gives S = 1.0 × e^(−2) = 0.1353, i.e. 13.5 percent — past its peak, it is getting worse.",
                "At G = 1.0: slotted gives S = 1.0 × e^(−1) = 0.3679, i.e. 36.8 percent — its maximum.",
                "Conclusion: slotted ALOHA is better at every load, and the gap widens as the load grows, because the pure version's 2× window punishes every extra attempt twice as hard.",
              ],
            },
            {
              type: "note",
              text: "The two numbers to memorize are 18.4 percent for pure ALOHA at G = 0.5 and 36.8 percent for slotted ALOHA at G = 1. Slotted is exactly double, and the reason is that its vulnerable time is exactly half.",
            },
          ],
        },
        {
          type: "viz",
          viz: "aloha-collision",
        },
      ],
    },
    {
      id: "s4",
      title: "CSMA and the Persistence Methods",
      body: [
        {
          type: "fig",
          fig: "m07-p12-carrier-sense-multiple-access-csma",
        },
        {
          type: "fig",
          fig: "m07-p13-vulnerable-time-in-csma",
        },
        {
          type: "fig",
          fig: "m07-p14-csma-persistence-methods",
        },
        {
          type: "fig",
          fig: "m07-p15-csma-persistent-flow",
        },
        {
          type: "list",
          items: [
            "**CSMA** = listen before sending (**carrier sense**), which sharply cuts collisions.",
            "It cannot eliminate them, because of **propagation delay**: a station's signal takes time to reach the others.",
            "Persistence methods decide what to do when the channel is busy: **1-persistent** (send the instant it frees), **non-persistent** (wait a random time), **p-persistent** (send with probability p).",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "the three persistence modes",
          body: [
            {
              type: "p",
              text: "Carrier sense multiple access requires that each station first listen to the medium — check the state of the medium — before sending. Instead of transmitting blindly as ALOHA does, a CSMA station asks the physical layer whether the channel is busy. If the channel is idle, it proceeds; if not, the protocol's persistence rule tells it what to do with the waiting time. The name decomposes neatly: carrier sense means listening before transmitting, multiple access means several stations share the same channel, and the persistence rule is the add-on that makes the scheme usable.",
            },
            {
              type: "p",
              text: "Carrier sense reduces the possibility of a collision, but it cannot eliminate it. The possibility survives because of propagation delay: when a station sends a frame, it still takes time — although very short — for the first bit to reach every station and for every station to sense it. A station far from the transmitter may sample the medium a microsecond before that first bit arrives, find the channel apparently idle, and begin its own transmission. Both signals then arrive at the far end together and collide.",
            },
            {
              type: "p",
              text: "This is why the vulnerable time in CSMA is one propagation delay Tp rather than a frame time. The window during which a second station can wrongly conclude the medium is free equals the time it takes the first bit to cross the medium — the propagation delay. Shorten the medium and the window shrinks; the CSMA vulnerable time has nothing to do with how long the frame is.",
            },
            {
              type: "formula",
              tex: "T_{\\text{vuln}}^{\\text{CSMA}} = T_p, \\qquad \\text{with } \\rho = \\frac{T_p}{T_{fr}} \\text{ bounded by } \\rho \\le 0.01 \\text{ for good efficiency}",
              text: "CSMA's vulnerable time is one propagation delay, not one frame time. The ratio rho of propagation delay to frame time is kept small — around one percent or less — so that the window is a negligible fraction of the transmission.",
            },
            {
              type: "h3",
              text: "The three persistence methods",
            },
            {
              type: "p",
              text: "When a station finds the channel busy, the persistence method decides what it does next. The channel has just been sampled, so the station must decide whether to sample again immediately, sample again after a random wait, or sample on a probability. Each choice trades collision rate against idle time, and the names come directly from those choices.",
            },
            {
              type: "list",
              items: [
                "1-persistent: the station senses continuously and transmits with probability 1 as soon as the medium goes idle. Simple and greedy — it wastes no idle time at all.",
                "Non-persistent: the station senses once; if the channel is busy it waits a random amount of time and then senses again. It never piles on immediately after an idle period.",
                "p-persistent: used on slotted channels. When a slot becomes idle the station transmits with probability p and defers to the next slot with probability 1 − p; if the next slot is also idle it repeats the coin flip.",
              ],
            },
            {
              type: "h3",
              text: "Comparing the three persistence methods",
            },
            {
              type: "table",
              head: ["Method", "Behavior when channel busy", "Behavior when channel goes idle", "Chief weakness"],
              rows: [
                ["1-persistent", "Keeps sensing continuously", "Transmits immediately (probability 1)", "Many stations pounce at once — high collision rate"],
                ["Non-persistent", "Waits a random time, then senses again", "Transmits immediately if found idle", "Random waits leave the channel idle when someone could have sent"],
                ["p-persistent", "Waits for the next slot boundary", "Transmits with probability p per idle slot", "Needs a slotted channel and a tuned value of p"],
              ],
            },
            {
              type: "p",
              text: "The intuition is a trade rather than a ranking. 1-persistent minimizes wasted idle time but maximizes collisions; non-persistent minimizes collisions but leaves idle gaps; p-persistent is the tunable middle. Set p to 1 and p-persistent becomes 1-persistent on a slotted channel; set p low and it approaches the non-persistent behavior while still respecting slot boundaries.",
            },
            {
              type: "example",
              text: "Three stations share a slotted channel and a slot becomes idle. With p-persistent access using p = 0.25, estimate how many idle slots pass before somebody transmits, and how often all three collide.",
              steps: [
                "The probability that a given station defers in a slot is 1 − p = 0.75, so the probability that all three defer is 0.75 × 0.75 × 0.75 = 0.4219.",
                "The expected number of idle slots wasted before at least one station transmits is 1/(1 − 0.4219) = 1.73 slots.",
                "The probability that two or more of the three transmit in the same slot, causing a collision, is 1 − P(exactly none) − P(exactly one).",
                "P(exactly one transmits) = 3 × 0.25 × 0.75 × 0.75 = 0.4219, and P(none) = 0.4219, so P(collision) = 1 − 0.4219 − 0.4219 = 0.1563.",
                "With a small p the collision probability is held near 16 percent while the channel is idle only about 1.7 slots; raising p toward 1 would crush the idle time but push the collision probability far higher.",
              ],
            },
          ],
        },
      ],
    },
    {
      id: "s5",
      title: "CSMA/CD: Collision Detection and Binary Exponential Backoff",
      body: [
        {
          type: "fig",
          fig: "m07-p16-carrier-sense-multiple-access-collis",
        },
        {
          type: "fig",
          fig: "m07-p17-collision-of-the-first-bit-in-csma-c",
        },
        {
          type: "fig",
          fig: "m07-p18-collision-and-abortion-in-csma-cd",
        },
        {
          type: "fig",
          fig: "m07-p19-flow-diagram-for-the-csma-cd",
        },
        {
          type: "list",
          items: [
            "**CSMA/CD** adds collision *detection* to carrier sense — keep listening while transmitting.",
            "On detecting a collision: **abort, send a jam signal, then back off** — this is **binary exponential backoff**.",
            "The **minimum frame length** exists so a sender is still transmitting when the collision returns; that is why Ethernet frames are **64 bytes** minimum.",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "backoff and the 64-byte rule",
          body: [
            {
              type: "p",
              text: "CSMA senses the carrier but the basic method does not specify what happens after a collision, so CSMA/CD augments the algorithm to handle collisions. The addition is the slash-CD, collision detection. A station monitors the medium after it sends a frame to see whether the transmission was successful. If so, the station is finished. If there is a collision, the frame is sent again. Detection is possible because a station that is transmitting can simultaneously listen on the medium and compare what it hears with what it sent; a mismatch means somebody else's signal is on the wire.",
            },
            {
              type: "h3",
              text: "The first bit and the worst-case collision window",
            },
            {
              type: "p",
              text: "Consider the classic two-station picture. Station A begins transmitting and its first bit travels toward B. Just before that bit arrives, B — seeing an idle medium — begins its own transmission. B's first bit and A's first bit meet somewhere in the middle and collide. The collision does not propagate back to A instantly; both stations keep transmitting until each has heard the other's signal, at which point both can detect the mismatch.",
            },
            {
              type: "p",
              text: "The worst case is when the second station transmits the instant before the first station's frame arrives. The first station then needs up to one round-trip time — twice the propagation delay, 2 × Tp — to learn that a collision occurred. This is the reason CSMA/CD imposes a minimum frame size. A frame must still be in progress after 2 × Tp, otherwise the sender will have finished transmitting and stopped listening before the collision signal can return, and it will wrongly believe the frame succeeded.",
            },
            {
              type: "formula",
              tex: "T_{fr} \\ge 2 \\times T_p \\quad \\Longleftrightarrow \\quad L_{\\min} = 2 \\times T_p \\times R",
              text: "The frame time must be at least one round-trip propagation time, which means the minimum frame length in bits equals twice the propagation delay multiplied by the data rate.",
            },
            {
              type: "example",
              text: "Classic Ethernet: a 10 Mbps coax bus with a maximum end-to-end propagation delay giving a round-trip time of 51.2 microseconds. Find the minimum frame size and check it against the well-known 64-byte figure.",
              steps: [
                "The minimum frame must occupy the channel for the full round trip, so L_min = 2 × Tp × R.",
                "Substituting: L_min = 51.2 × 10^(−6) s × 10 × 10^6 bits/s = 512 bits.",
                "Convert to bytes: 512 / 8 = 64 bytes.",
                "This is exactly the standard 802.3 minimum frame size — frames shorter than 64 bytes are padded up to 64 bytes precisely so that collision detection can work.",
                "If the data rate were raised to 100 Mbps on the same medium, the same 51.2 microseconds would demand a 5120-bit frame; that is why faster Ethernet versions either shorten the medium or extend the frame (carrier extension) instead.",
              ],
            },
            {
              type: "h3",
              text: "Jam signal and binary exponential backoff",
            },
            {
              type: "p",
              text: "When a collision is detected the station does not simply stop mid-frame, because a truncated frame is easily mistaken for a valid short frame. It sends a short jam signal to make sure every other station on the segment notices the collision too, then aborts and waits before retrying. The waiting is governed by binary exponential backoff, which is what keeps CSMA/CD stable under load.",
            },
            {
              type: "p",
              text: "After the nth collision the station picks a random integer k uniformly from the range 0 through 2^n − 1 and waits k slot times before sensing again. After the first collision the choice is 0 or 1, after the second it is 0 through 3, after the third 0 through 7, and so on. Ethernet caps n at 10, so the range stops growing at 0 through 1023, and after 16 collisions the frame is dropped and reported as an error. The doubling is the point: stations that have collided repeatedly spread out over an ever-wider window, so the probability that they collide a second or third time falls sharply.",
            },
            {
              type: "formula",
              tex: "n \\text{ collisions} \\Rightarrow k \\in \\{0, 1, \\dots, 2^{n}-1\\}, \\quad \\text{wait } k \\times \\text{slot time}",
              text: "After n collisions a station draws a random backoff k from zero up to two to the n minus one slots, and waits that many slot times before trying the channel again.",
            },
            {
              type: "example",
              text: "Two stations on an Ethernet both have frames ready and collide five times in a row. How wide is the backoff window each time, and what is the chance they pick the same slot on the fifth retry?",
              steps: [
                "1st collision: k is chosen from {0, 1}, a window of 2 slots.",
                "2nd collision: k is chosen from {0, 1, 2, 3}, a window of 4 slots.",
                "3rd collision: window of 8 slots; 4th collision: window of 16 slots.",
                "5th collision: the window is 2^5 = 32 slots, so k ranges over 0 through 31.",
                "If both stations draw independently and uniformly, the chance they draw the same value is 1/32, or 3.125 percent — down from 50 percent after the first collision and 25 percent after the second.",
                "That steep fall in agreement probability is exactly why backoff suppresses repeated collisions without any central coordination.",
              ],
            },
            {
              type: "note",
              text: "CSMA/CD works because the medium is bidirectional: a transmitting station can listen while it talks. This is true on a shared coax bus and on a switched full-duplex link, but it is not true on radio, where the station's own strong local transmission deafens its receiver. That physical fact, not any design preference, is why wireless uses CSMA/CA instead.",
            },
          ],
        },
        {
          type: "viz",
          viz: "backoff",
        },
      ],
    },
    {
      id: "s6",
      title: "CSMA/CA: Interframe Space, Contention Window, and Acknowledgments",
      body: [
        {
          type: "fig",
          fig: "m07-p20-carrier-sense-multiple-access-collis",
        },
        {
          type: "fig",
          fig: "m07-p21-flow-diagram-csma-ca",
        },
        {
          type: "fig",
          fig: "m07-p22-timing-in-csma-ca",
        },
        {
          type: "list",
          items: [
            "**CSMA/CA** is for wireless, where you **cannot detect** a collision while transmitting.",
            "It avoids rather than detects, using three mechanisms: **interframe space, contention window, acknowledgment**.",
            "The **ACK + time-out timer** is what makes it reliable — no ACK means assume loss and retry.",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "why wireless needs CA",
          body: [
            {
              type: "p",
              text: "CSMA/CA was invented for wireless networks, where collision detection is impractical. A radio transmitter cannot easily hear a collision while it is transmitting, and even if it could, it would not detect every collision, because the hidden-node problem means the interfering station may be out of range of the sender entirely. The protocol therefore attacks the problem from the other direction: instead of detecting collisions, it tries to avoid them.",
            },
            {
              type: "p",
              text: "Collisions are avoided through the use of CSMA/CA's three strategies: the interframe space, the contention window, and acknowledgments. Each addresses a different failure mode, and the exam usually asks about all three together, so it is worth keeping them as a labelled trio rather than a jumble of timers.",
            },
            {
              type: "list",
              items: [
                "Interframe space (IFS): a period of time before transmission is deferred even when the channel is idle. Waiting this long gives a station that has already started transmitting a chance to be heard, so a station that has merely not yet sensed anything does not jump in prematurely.",
                "Contention window: an amount of time divided into slots, in which a station that is ready to send chooses a random number of slots as its wait time. Two stations that are both waiting therefore almost certainly choose different numbers and do not collide.",
                "Acknowledgement: a positive acknowledgment, backed by a time-out timer, helps guarantee that the receiver received the frame. The absence of a collision is not evidence of anything on radio, so an explicit ACK is the only proof of delivery.",
              ],
            },
            {
              type: "h3",
              text: "The procedure, step by step",
            },
            {
              type: "p",
              text: "The flow diagram on the slide spells out the logic in a chain of questions. The station asks whether the channel is idle; if it is, it still does not transmit — it waits one IFS. After the IFS, it checks again. Only if the channel is still idle does it enter the contention window, pick a random number of slots, and wait that long. Having waited the chosen number of slots with every one of them idle, it transmits and then waits for a time-out period for the acknowledgment.",
            },
            {
              type: "list",
              items: [
                "Sense the channel. If busy, apply a persistence strategy with backoff until the channel is idle.",
                "Wait one IFS. Do not transmit merely because the channel looks idle.",
                "Re-check the channel. If it is still idle, enter the contention window.",
                "Choose a random number of slots and wait that many slots, all of which must pass idle.",
                "Transmit the frame and start the time-out timer; retry with a larger window if no acknowledgment comes back.",
              ],
            },
            {
              type: "p",
              text: "The size of a slot is fixed by the physical layer. The slide gives 50 microseconds for 802.11 frequency-hopping and 20 microseconds for 802.11 direct sequence. A slot must be at least as long as the time needed for a station to sense the medium and then begin transmitting, since otherwise two stations could still decide to transmit in the same apparent slot.",
            },
          ],
        },
        {
          type: "viz",
          viz: "csma-cd-vs-ca",
        },
      ],
    },
    {
      id: "s7",
      title: "SIFS, DIFS, RTS/CTS, and the Network Allocation Vector",
      body: [
        {
          type: "fig",
          fig: "m07-p23-csma-ca-frame-exchange",
        },
        {
          type: "fig",
          fig: "m07-p24-network-allocation-vector-nav",
        },
        {
          type: "list",
          items: [
            "**SIFS** (short) is for control and ACK frames; **DIFS** (long) is for ordinary data. Shorter gap = higher priority.",
            "**RTS/CTS**: the sender asks permission and the receiver grants it, so other stations hear the reservation.",
            `Every station that hears the RTS/CTS sets its **NAV (Network Allocation Vector)** — a timer saying "stay quiet this long".`,
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "what the NAV protects",
          body: [
            {
              type: "p",
              text: "The IFS in the abstract becomes concrete as two specific values in 802.11. The short interframe space (SIFS) is the shorter gap, reserved for control and acknowledgment frames that must go out quickly and that are never subject to contention. The DCF interframe space (DIFS) is the longer gap, used by a station that wants to start a new data exchange. Because SIFS is shorter than DIFS, a station that is in the middle of an exchange always wins the race against a station trying to start a new one — the timing hierarchy itself enforces priority without any explicit arbitration.",
            },
            {
              type: "h3",
              text: "The four-step frame exchange",
            },
            {
              type: "p",
              text: "The frame exchange on the slide proceeds in four steps, and the ordering is what creates the reservation effect. First, before sending a frame, the source station senses the medium by checking the energy level at the carrier frequency, using a persistence strategy with backoff until the channel is idle. Once the channel is found idle, the station waits for a period called the DIFS and then sends a control frame called the request to send (RTS).",
            },
            {
              type: "list",
              items: [
                "Step 1 — source senses the carrier, backs off until idle, waits DIFS, then sends an RTS control frame.",
                "Step 2 — after receiving the RTS and waiting a SIFS, the destination sends a control frame called clear to send (CTS), indicating it is ready to receive.",
                "Step 3 — the source station sends its data after waiting an amount of time equal to SIFS.",
                "Step 4 — the destination station, after waiting another SIFS, sends an acknowledgment to show that the frame has been received.",
              ],
            },
            {
              type: "p",
              text: "Acknowledgments are needed in this protocol for a reason quite unlike Ethernet's. A CSMA/CA station has no means to check for the successful arrival of its data at the destination: it cannot listen for a collision, and the WLAN hardware does not echo its own signal back to it. On the other hand, in CSMA/CD, the absence of a collision is itself a kind of indication to the source that the data arrived. That difference in evidence is the whole reason one protocol acknowledges every frame and the other does not.",
            },
            {
              type: "h3",
              text: "Network allocation vector",
            },
            {
              type: "p",
              text: "Collision avoidance is achieved using the network allocation vector. When a station sends an RTS frame it includes the duration of time that it needs to occupy the channel — the time for the CTS, the data frame, the acknowledgment, and all the intervening SIFS gaps. Every station that is affected by this transmission creates a timer called a network allocation vector (NAV). The NAV shows how much time must pass before those stations are allowed to check the channel for idleness.",
            },
            {
              type: "p",
              text: "The mechanics are simple but the effect is powerful. Each time a station accesses the system and sends an RTS frame, other stations start their NAV. Each station, before sensing the physical medium to see whether it is idle, first checks its NAV to see whether it has expired. If the NAV is still running, the station does not even bother sensing — it knows the medium is reserved. This is called virtual carrier sensing, and it sits alongside the physical carrier sensing that listens to the actual energy on the channel.",
            },
            {
              type: "formula",
              tex: "T_{\\text{NAV}} = \\text{SIFS} + T_{\\text{CTS}} + \\text{SIFS} + T_{\\text{data}} + \\text{SIFS} + T_{\\text{ACK}}",
              text: "The duration written into the RTS covers the whole exchange: one SIFS plus the CTS, another SIFS plus the data frame, and another SIFS plus the acknowledgment.",
            },
            {
              type: "example",
              text: "A station sends an RTS advertising a duration of 500 microseconds. A nearby station, hearing the RTS, has its own 180-microsecond frame ready. What does the second station do, and when may it transmit?",
              steps: [
                "The second station sets NAV = 500 microseconds immediately on decoding the RTS duration field.",
                "It does not sense the medium while the NAV runs, because the channel is reserved for the RTS's owner — sensing would be wasted effort and could tempt a premature transmission.",
                "A third station that is too far away to hear the RTS but within range of the receiver would hear the CTS instead, and the CTS carries a duration field too, so it also sets an NAV.",
                "When the 500 microseconds expire, the second station returns to normal operation: it senses the channel, and if the channel is idle it waits one DIFS before entering the contention window.",
                "Net effect: the second station's 180-microsecond frame was never in danger of colliding, purely because of a timer derived from a control frame it overheard.",
              ],
            },
          ],
        },
      ],
    },
    {
      id: "s8",
      title: "Hidden and Exposed Node Problems",
      body: [
        {
          type: "fig",
          fig: "m07-p25-hidden-node-problem",
        },
        {
          type: "list",
          items: [
            "**Hidden node**: A and C can both reach the AP but not each other, so they transmit together and collide at the AP.",
            "**Exposed node**: B holds back unnecessarily because it hears a transmission that would not actually have affected it.",
            "Both are fixed by **RTS/CTS**, which is why it exists despite the overhead.",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "both node problems",
          body: [
            {
              type: "p",
              text: "The hidden node problem, also called the hidden terminal problem or hidden station problem, occurs when a node can communicate with a wireless access point (AP) but cannot directly communicate with other nodes that are communicating with that same AP. In a typical arrangement, station A and station C are both in range of the AP, but A is out of range of C and C is out of range of A, because some obstacle or merely distance separates them.",
            },
            {
              type: "p",
              text: "This leads to difficulties in medium access control, because multiple nodes can send data packets to the AP simultaneously, which creates interference at the AP and results in no packet getting through. The crux is that carrier sensing fails here through no fault of the algorithm. Station A senses the medium before transmitting, hears nothing, and correctly concludes from the evidence available to it that the channel is idle. It has no way to know that C is already transmitting, because C's signal never reaches it. The collision happens at the AP, not at the sender, so the sender's sensing was accurate yet useless.",
            },
            {
              type: "p",
              text: "The solution is to use the RTS and CTS handshake frames, and the beauty of the solution is that the CTS travels the other direction. Station A sends an RTS to the AP; the AP replies with a CTS that is broadcast and heard by every station in range of the AP — including station C. Because C hears the CTS and cannot hear the RTS, C learns about the reservation from the reply rather than from the request. The hidden station is not hidden from the AP, and the CTS is sent by the AP, so hiding is neutralized.",
            },
            {
              type: "table",
              head: ["Aspect", "Hidden node", "Exposed node"],
              rows: [
                ["Core problem", "Two senders cannot hear each other, so both transmit and collide at the AP", "A station hears an unrelated transmission and wrongly defers"],
                ["Who loses", "Both transmissions are destroyed at the receiver", "The deferring station waits and loses throughput for no reason"],
                ["Root cause", "Asymmetry of radio range, not a protocol bug", "Over-conservative carrier sense: listening is not identity"],
                ["RTS/CTS effect", "Solves it: the CTS is heard by the hidden station and sets its NAV", "Can worsen it, since the deferring station may also hear the CTS"],
                ["Classic mitigation", "RTS/CTS handshake", "Careful decision of whether to defer, sometimes lower transmit power"],
              ],
            },
            {
              type: "p",
              text: "The exposed node problem is the mirror image, and students often conflate the two. An exposed node is a station that hears a transmission which will not actually interfere with what it wants to send, yet it defers anyway. Suppose B is transmitting to A, and C, which is near B, has a frame for D on the far side. C hears B's transmission, concludes the medium is busy, and waits — even though C's transmission to D would not have collided with B's transmission to A at all, because D is far from A. Carrier sense has produced a false positive rather than a false negative.",
            },
            {
              type: "p",
              text: "Put side by side, the two problems are the two kinds of error a sensing rule can make. Hidden node is a false negative: the medium is busy but the station believes it is idle, so it transmits and ruins a frame. Exposed node is a false positive: the medium is effectively free for the station's purposes, but the station believes it is busy, so it stays silent and wastes capacity. Hidden nodes are disastrous because they destroy data; exposed nodes are merely wasteful because they idle the channel.",
            },
            {
              type: "note",
              text: "One-line keepsake: hidden node hears nothing and collides; exposed node hears everything and waits. The RTS/CTS handshake is the standard cure for the first and can aggravate the second.",
            },
          ],
        },
      ],
    },
    {
      id: "s9",
      title: "Controlled Access: Reservation, Polling, and Token Passing",
      body: [
        {
          type: "fig",
          fig: "m07-p26-controlled-access-protocols",
        },
        {
          type: "fig",
          fig: "m07-p27-controlled-access",
        },
        {
          type: "fig",
          fig: "m07-p28-reservation-method",
        },
        {
          type: "fig",
          fig: "m07-p29-polling",
        },
        {
          type: "fig",
          fig: "m07-p30-polling",
        },
        {
          type: "fig",
          fig: "m07-p31-token-passing",
        },
        {
          type: "fig",
          fig: "m07-p32-logical-ring-in-token-passing",
        },
        {
          type: "list",
          items: [
            "**Controlled access** abandons contention: a station may not send until it is **authorised**.",
            "**Reservation** — stations book a slot in advance. **Polling** — a primary station asks each in turn.",
            "**Token passing** — a token circulates; only its holder may transmit. Deterministic, but the token adds delay and a single point of failure.",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "the three controlled methods",
          body: [
            {
              type: "p",
              text: "Controlled access protocols abandon contention entirely. Stations consult one another to find which station has the right to send, and a station cannot send unless it has been authorized by other stations. Because every transmission is preceded by an authorization, collisions are structurally impossible — not merely unlikely — and the protocol's behavior under heavy load becomes predictable rather than probabilistic. The cost is the overhead of the consultation itself and, in the polling case, a nasty single point of failure.",
            },
            {
              type: "table",
              head: ["Protocol", "Authorization mechanism", "Overhead", "Failure mode"],
              rows: [
                ["Reservation", "A minislot claimed in a reservation frame", "N minislots per interval regardless of demand", "Reservation frame itself can be lost"],
                ["Polling", "Primary station polls each secondary in turn", "One poll/select exchange per turn", "Primary station failure takes the system down"],
                ["Token passing", "Possession of a circulating token", "Token transmission per station per round", "Token loss destroys access until regenerated"],
              ],
            },
            {
              type: "h3",
              text: "The reservation method",
            },
            {
              type: "p",
              text: "In the reservation method, a station needs to make a reservation before sending data. Time is divided into intervals, and in each interval a reservation frame precedes the data frames sent in that interval. If there are N stations in the system, there are exactly N reservation minislots in the reservation frame — one per station, in a fixed order. When a station needs to send a data frame it makes a reservation in its own minislot. The stations that have made reservations then send their data frames after the reservation frame, in the order in which their minislots appear.",
            },
            {
              type: "p",
              text: "The scheme is a hybrid in spirit: the reservation minislots are contended, but the data transmission that follows is not. Stations with nothing to send leave their minislot idle, so the reservation frame is a compact bit map of demand. A useful property is that a station's reservation can cover several data frames, not just one, which amortizes the reservation overhead across a burst of traffic.",
            },
            {
              type: "example",
              text: "A reservation system has 20 stations, a reservation minislot costs 1 bit on the wire, and a data frame carries 1000 bits. Compute the overhead when all 20 stations transmit and when only 3 do.",
              steps: [
                "The reservation frame always costs 20 minislots × 1 bit = 20 bits, no matter how many stations actually want to send.",
                "Case 1 — all 20 stations send one frame each: useful data is 20 × 1000 = 20 000 bits, overhead is 20 bits, so efficiency is 20 000 / 20 020 = 99.9 percent.",
                "Case 2 — only 3 stations send: useful data is 3 × 1000 = 3000 bits, overhead is still 20 bits, so efficiency is 3000 / 3020 = 99.34 percent.",
                "Both cases are excellent, which is the reservation method's strength; but the overhead is fixed while the useful load shrinks, so with 1000 stations and one sender the 1000-bit reservation frame would dominate a single 1000-bit data frame.",
              ],
            },
            {
              type: "h3",
              text: "Polling",
            },
            {
              type: "p",
              text: "Polling works with topologies in which one device is designated as a primary station and the other devices are secondary stations. The primary device controls the link; the secondary devices follow its instructions. This method uses poll and select functions to prevent collisions, and the primary's failure takes the whole system down — the drawback the slide names explicitly.",
            },
            {
              type: "list",
              items: [
                "Select — used whenever the primary device has something to send. The primary alerts the secondary to the upcoming transmission and waits for an acknowledgment of the secondary's ready status. After that acknowledgment the primary can send data and then wait for an acknowledgment of the data.",
                "Poll — used by the primary device to solicit transmissions from the secondary devices. When the primary is ready to receive data it must ask, or poll, each device in turn whether it has anything to send. A secondary responds with a NAK if it has nothing to send; otherwise it sends its data and waits for an acknowledgment.",
              ],
            },
            {
              type: "p",
              text: "Select and poll are therefore the two directions of a controlled exchange: select pushes data outward from the primary, and poll pulls data inward toward it. Between them they cover every transmission on the link, which is precisely why no collision can occur — a secondary never speaks unless spoken to. Note the awkward but real weakness: the primary must poll stations that have nothing to say, so the polling overhead is proportional to the number of idle stations rather than to the traffic.",
            },
            {
              type: "h3",
              text: "Token passing",
            },
            {
              type: "p",
              text: "In the token-passing method the stations in a network are organized in a logical ring. For each station there is a predecessor, the station logically before it in the ring, and a successor, the station logically after it. A special packet called a token circulates through the ring, and possession of the token gives the station the right to access the channel and send its data. When a station has data to send it waits until it receives the token from its predecessor.",
            },
            {
              type: "p",
              text: "Token management is needed for this access method. The token must be monitored to ensure it has not been lost or destroyed, because a lost token silences every station on the ring at once — nobody will ever be authorized again. Typical management functions are a monitor station that regenerates a missing token after a timeout and a rule that removes duplicate tokens if two somehow circulate.",
            },
            {
              type: "p",
              text: "A key subtlety is that the ring need not be the physical topology. In a physical ring topology, when a station sends the token to its successor, the token cannot be seen by other stations; the successor is the next one in line. The dual ring topology uses a second auxiliary ring operating in the reverse direction compared with the main ring, kept idle for emergencies — when one of the links in the main ring fails, the system automatically combines the two rings to form a temporary ring, and after the failed link is restored the auxiliary ring becomes idle again.",
            },
            {
              type: "p",
              text: "In the bus ring topology, also called a token bus, the stations are connected to a single cable called a bus, and each station knows the address of its successor. When a station has finished sending its data it releases the token and inserts the address of its successor into the token, so the logical ring is imposed by addresses rather than by cabling. In a star ring topology the physical topology is a star and it uses a hub that acts as the connector; the wiring inside the hub makes the ring, which is how a Token Ring network presents a star appearance while remaining a logical ring.",
            },
          ],
        },
      ],
    },
    {
      id: "s10",
      title: "Channelization: FDMA and TDMA",
      body: [
        {
          type: "fig",
          fig: "m07-p33-channelization",
        },
        {
          type: "fig",
          fig: "m07-p34-channelization",
        },
        {
          type: "fig",
          fig: "m07-p35-frequency-division-multiple-access",
        },
        {
          type: "fig",
          fig: "m07-p36-difference-between-fdma-and-fdm",
        },
        {
          type: "fig",
          fig: "m07-p37-time-division-multiple-access-tdma",
        },
        {
          type: "list",
          items: [
            "**Channelization** divides the link's capacity **permanently** among stations, rather than contending for it.",
            "**FDMA** splits the **frequency** band; **TDMA** splits the **time** into repeating slots.",
            "Both give guaranteed access — no collisions — but waste capacity when a station is idle.",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "FDMA vs TDMA",
          body: [
            {
              type: "p",
              text: "Channelization is a multiple-access method in which the available bandwidth of a link is shared in time, in frequency, or through code, among different stations. Unlike random access there is no contention and unlike controlled access there is no ongoing consultation: the division of the channel is settled in advance, and each station uses its own allotted slice without asking anyone. Three channelization protocols are examined here: FDMA, TDMA, and CDMA.",
            },
            {
              type: "h3",
              text: "FDMA — frequency division multiple access",
            },
            {
              type: "p",
              text: "In frequency-division multiple access, the available bandwidth is divided into frequency bands. Each station is allocated a band to send its data, and that band is reserved for that station for the whole session. Allocated bands are separated from one another by small guard bands to prevent interference, and FDMA specifies a predetermined frequency band for the entire period of communication. Its classic application is the cellular phone system.",
            },
            {
              type: "formula",
              tex: "B_{\\text{total}} = \\sum_{i=1}^{N} \\left( B_i + B_{g} \\right)",
              text: "The total bandwidth equals the sum, over all stations, of each station's own band width plus the guard band needed to keep it from bleeding into its neighbour.",
            },
            {
              type: "p",
              text: "The slide also insists on a distinction that is a favourite exam question: FDMA is not FDM. FDM is a physical layer technique that combines the loads from low-bandwidth channels and transmits them by using a high-bandwidth channel. The multiplexer modulates the signals, combines them, and creates a bandpass signal, and the bandwidth of each channel is shifted by the multiplexer. FDMA, by contrast, is an access method in the data-link layer: the data-link layer in each station tells its physical layer to make a bandpass signal from the data passed to it, and there is no physical multiplexer at the physical layer at all.",
            },
            {
              type: "table",
              head: ["Aspect", "FDM", "FDMA"],
              rows: [
                ["Layer", "Physical layer", "Data-link (MAC) layer"],
                ["Purpose", "Multiplex several low-bandwidth channels onto one high-bandwidth link", "Give multiple stations controlled access to a shared medium"],
                ["Mechanism", "A physical multiplexer shifts and combines signals", "Each station's own data-link layer drives its physical layer to emit a bandpass signal"],
                ["Hardware", "Physical multiplexer at the physical layer", "No physical multiplexer at the physical layer"],
                ["Failure mode", "Multiplexer failure breaks the combined link", "A station can fail without affecting others, but its band is wasted"],
              ],
            },
            {
              type: "h3",
              text: "TDMA — time division multiple access",
            },
            {
              type: "p",
              text: "In time-division multiple access, the stations share the bandwidth of the channel in time. Each station is allocated a time slot during which it can send data, and the slots repeat in a fixed cycle. The main problem with TDMA lies in achieving synchronization between the different stations: because of propagation delay, stations at different distances see the slot boundaries at different moments, and this skew can be compensated using a guard time at the start of each slot.",
            },
            {
              type: "p",
              text: "A second synchronization problem is at bit level rather than slot level, so preamble bits, also called synchronization bits, are used at the head of each slot to let the receiver lock onto the incoming bit stream before the payload arrives. Together, the guard time buys tolerance against distance and the preamble buys tolerance against clock drift. The overall frame must also be preceded by a synchronization burst so that every station agrees on where the cycle starts.",
            },
            {
              type: "formula",
              tex: "T_{\\text{frame}} = \\sum_{i=1}^{N} \\left( T_{\\text{slot},i} + T_{\\text{guard}} \\right)",
              text: "One TDMA cycle is the sum, over every station, of that station's usable slot plus a guard time, and the whole cycle repeats forever.",
            },
            {
              type: "example",
              text: "A TDMA system has 8 stations. Each station's payload slot carries 1000 bits, the preamble costs 32 bits, the guard time equals the transmission time of 16 bits, and the channel runs at 100 kbps. Find the frame length, the efficiency, and each station's data rate.",
              steps: [
                "Per-station overhead is 32 preamble bits + 16 guard bits = 48 bits, so each slot occupies 1000 + 48 = 1048 bit-times.",
                "The whole frame is 8 × 1048 = 8384 bit-times, i.e. 8384 bits of channel time per cycle.",
                "Efficiency = useful bits / total bits = (8 × 1000) / 8384 = 8000 / 8384 = 95.4 percent.",
                "The frame duration is 8384 bits / 100 000 bits per second = 83.84 milliseconds.",
                "Each station gets 1000 useful bits per 83.84 ms, so its data rate is 1000 / 0.08384 s = 11 926 bits per second, or about 11.9 kbps.",
                "The channel's raw 100 kbps is thereby divided eight ways at roughly 11.9 kbps of payload each, the rest consumed by preamble and guard overhead.",
              ],
            },
          ],
        },
      ],
    },
    {
      id: "s11",
      title: "CDMA: Chips, Orthogonal Sequences, and the Walsh Table",
      body: [
        {
          type: "fig",
          fig: "m07-p38-code-division-multiple-access-cdma",
        },
        {
          type: "fig",
          fig: "m07-p39-digital-signal-created-by-four-stati",
        },
        {
          type: "fig",
          fig: "m07-p40-decoding-of-the-composite-signal-for",
        },
        {
          type: "list",
          items: [
            "**CDMA** lets every station transmit **simultaneously on the same band**, using different **codes**.",
            "Each station gets an **orthogonal chip sequence**; orthogonality means their signals cancel at every other receiver.",
            "The **Walsh table** is the standard way to generate those orthogonal sequences.",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "how orthogonality works",
          body: [
            {
              type: "p",
              text: "Code division multiple access allows several stations to use a channel simultaneously. Where FDMA slices the spectrum and TDMA slices the clock, CDMA slices neither: every station transmits at the same time over the same frequency band, and the separation is achieved by assigning each station a code that is a sequence of numbers called chips.",
            },
            {
              type: "p",
              text: "The sequences of chips are carefully chosen and are called orthogonal sequences. An orthogonal sequence has special properties that produce specific results for certain operations — specifically, the inner product of a sequence with itself is a positive constant while the inner product of a sequence with any other sequence in the set is zero. Sequences are generated using the Walsh table, which is a two-dimensional table with an equal number of rows and columns, and which can be built recursively by doubling.",
            },
            {
              type: "p",
              text: "Encoding works by multiplying, chip position by chip position, the data bit expressed as a signed number with the station's own chip sequence. A bit of 1 is encoded as +1 times the sequence; a bit of 0 is encoded as −1 times the sequence; a station that is idle contributes nothing at all. Because every station multiplies by its own orthogonal sequence, the composite signal that appears on the medium is simply the plain arithmetic sum of all the individual transmissions, chip position by chip position.",
            },
            {
              type: "p",
              text: "Decoding reverses the operation. The receiver takes the composite signal and computes its inner product with the chip sequence of the station it wants to hear, then divides by the number of chips in the sequence. Orthogonality guarantees the answer: every other station's contribution multiplies out to zero, and only the target station's bit remains, as a positive value for 1 or a negative value for 0.",
            },
            {
              type: "formula",
              tex: "d_i = \\frac{1}{N} \\left( S_{\\text{composite}} \\cdot C_i \\right), \\qquad C_i \\cdot C_j = \\begin{cases} N & i = j \\\\ 0 & i \\ne j \\end{cases}",
              text: "To hear station i, the receiver takes the dot product of the composite signal with station i's chip sequence and divides by the number of chips N. That works because a sequence dotted with itself gives N while any two different sequences in the set dot to zero.",
            },
            {
              type: "example",
              text: "Four stations share a CDMA channel using 4-chip Walsh sequences. Station 1 uses (1, 1, 1, 1), station 2 uses (1, −1, 1, −1), station 3 uses (1, 1, −1, −1), and station 4 uses (1, −1, −1, 1). Station 1 sends bit 1, station 2 sends bit 0, station 3 is silent, and station 4 sends bit 1. Build the composite signal and decode station 4.",
              steps: [
                "Check orthogonality first: each sequence dotted with itself gives 4, and every pair of different sequences dots to 0, so the set is valid.",
                "Station 1 sends +1, giving +1 × (1, 1, 1, 1) = (1, 1, 1, 1).",
                "Station 2 sends bit 0, encoded as −1, giving −1 × (1, −1, 1, −1) = (−1, 1, −1, 1).",
                "Station 3 is silent, contributing (0, 0, 0, 0).",
                "Station 4 sends +1, giving +1 × (1, −1, −1, 1) = (1, −1, −1, 1).",
                "Adding chip positions: (1 − 1 + 0 + 1, 1 + 1 + 0 − 1, 1 − 1 + 0 − 1, 1 + 1 + 0 + 1) = (1, 1, −1, 3). This is the composite signal on the medium.",
                "Decode station 4: dot the composite with (1, −1, −1, 1) to get 1×1 + 1×(−1) + (−1)×(−1) + 3×1 = 1 − 1 + 1 + 3 = 4.",
                "Divide by N = 4: 4 / 4 = 1, a positive value, so station 4 sent bit 1 — correct.",
                "Decode station 3 the same way: dot the composite with (1, 1, −1, −1) gives 1 + 1 + 1 − 3 = 0, and 0 / 4 = 0, correctly reporting that station 3 was silent.",
              ],
            },
            {
              type: "note",
              text: "The elegance of CDMA is that the decoder needs no schedule, no frequency allocation, and no coordination — only the target station's chip sequence. Orthogonality does all the work, which is why CDMA scales gracefully when many stations transmit continuously.",
            },
          ],
        },
        {
          type: "viz",
          viz: "cdma-orthogonality",
        },
      ],
    },
    {
      id: "s12",
      title: "Choosing a MAC Protocol: Trade-offs and Exam Patterns",
      body: [
        {
          type: "list",
          items: [
            "Every protocol here answers the same equation: **delay, throughput, determinism, overhead**.",
            "**Contention** minimises overhead but has no delay guarantee — good for bursty traffic.",
            "**Controlled access and channelization** guarantee delay at the cost of idle capacity — good for real-time traffic.",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "picking a protocol",
          body: [
            {
              type: "p",
              text: "Every protocol in this module is a solution to the same equation, and the terms of that equation are delay, throughput, determinism, and overhead. Contention methods minimize overhead and do best at light, bursty load but degrade once offered load approaches capacity. Controlled methods achieve near-perfect channel use at heavy load but pay a fixed overhead that becomes dominant when traffic is sparse. Channelization is unbeatable for continuous, predictable streams and wasteful for intermittent ones, since a reserved band or slot is gone whether or not it is used.",
            },
            {
              type: "table",
              head: ["Protocol", "Best when", "Throughput ceiling", "Deterministic delay?"],
              rows: [
                ["Pure ALOHA", "Almost never; instructional baseline", "18.4 percent of capacity", "No"],
                ["Slotted ALOHA", "Short, bursty, lightly loaded bursts", "36.8 percent of capacity", "No"],
                ["CSMA", "Load light and propagation delay small", "Above ALOHA; falls as load grows", "No"],
                ["CSMA/CD", "Wired shared medium, bidirectional channel", "High up to moderate load, then collapses", "No, but bounded by backoff growth"],
                ["CSMA/CA", "Wireless, where collisions cannot be sensed", "Moderate; overhead of IFS, backoff and ACK", "No, but RTS/CTS reserves time"],
                ["Reservation", "Many stations, bursty traffic with N minislots", "Very high; reservation cost amortized", "Partly, within an interval"],
                ["Polling", "Few secondaries, one controlling primary", "High; poll overhead grows with idle stations", "Yes, round-robin and predictable"],
                ["Token passing", "Heavy load on a ring or token bus", "Near 100 percent at heavy load", "Yes, bounded token rotation time"],
                ["FDMA", "Continuous traffic, cellular-style allocation", "Divided among N bands plus guard loss", "Yes, once the band is assigned"],
                ["TDMA", "Continuous traffic, synchronized stations", "Divided among N slots plus guard/preamble", "Yes, once the slot is assigned"],
                ["CDMA", "Many stations transmitting simultaneously", "Scales well; capacity limited by interference", "No, but no explicit coordination needed"],
              ],
            },
            {
              type: "h3",
              text: "The four numbers worth memorizing cold",
            },
            {
              type: "list",
              items: [
                "Pure ALOHA vulnerable time 2 × Tfr, maximum throughput 18.4 percent at G = 0.5.",
                "Slotted ALOHA vulnerable time 1 × Tfr, maximum throughput 36.8 percent at G = 1.",
                "CSMA vulnerable time Tp, with rho = Tp / Tfr kept near 0.01 or less.",
                "CSMA/CD minimum frame length 2 × Tp × R bits, which for classic 10 Mbps Ethernet works out to 512 bits, or 64 bytes.",
              ],
            },
            {
              type: "p",
              text: "Two derivations recur in examinations and are worth being able to reproduce rather than recall. The first is the ALOHA vulnerable-time argument: it is a purely geometric statement about which competitor start times overlap the frame, and it yields the exponents −2G and −G once you assume Poisson arrivals. The second is the CSMA/CD minimum-frame argument: it is a round-trip timing statement, and it yields the 64-byte Ethernet minimum as a necessary condition for collision detection to be possible at all.",
            },
            {
              type: "note",
              text: "A compact way to remember the whole module: ALOHA talks without listening (18.4 percent), slotted ALOHA talks without listening but on a clock (36.8 percent), CSMA listens before talking, CSMA/CD listens while talking, CSMA/CA asks permission before talking, and channelization never has to talk about it because the channel was divided in advance.",
            },
          ],
        },
      ],
    },
  ],
  flashcards: [
    { q: "Why is a shared link called a multi-point or broadcast link, and what new problem does that create?",
      a: "Because every transmission propagates to all attached stations. The new problem is medium access control: deciding which station may transmit so that two do not transmit at once and destroy each other's frames.", sec: "s1" },
    { q: "Which sublayer of the data-link layer handles access to the shared medium?",
      a: "The media access control (MAC) sublayer, which sits between logical link control above and the physical layer below.", sec: "s1" },
    { q: "What is the vulnerable time of pure ALOHA, and why is it that length?",
      a: "It is 2 × Tfr, two frame times. A frame is ruined by any competitor starting from one frame time before to one frame time after its own start, because pure ALOHA never senses the channel.", sec: "s3" },
    { q: "What is the vulnerable time of slotted ALOHA?",
      a: "1 × Tfr, one frame time. Transmissions can start only on slot boundaries, so partial overlap is impossible and a frame is ruined only by another frame in the same slot.", sec: "s3" },
    { q: "State the maximum throughput of pure and slotted ALOHA with the load at which each occurs.",
      a: "Pure ALOHA peaks at 1/(2e) ≈ 18.4 percent when G = 0.5. Slotted ALOHA peaks at 1/e ≈ 36.8 percent when G = 1. Slotted is exactly double.", sec: "s3" },
    { q: "What does carrier sense mean in CSMA, and why can it not eliminate collisions?",
      a: "It means each station listens to the medium before sending. Collisions survive because of propagation delay: the first bit takes time to reach every station, so a far station can sample the channel, find it apparently idle, and transmit just before the first bit arrives.", sec: "s4" },
    { q: "Describe 1-persistent, non-persistent and p-persistent CSMA.",
      a: "1-persistent senses continuously and transmits immediately when the medium is idle. Non-persistent waits a random time then senses again and transmits if idle. p-persistent transmits with probability p in each idle slot and defers with probability 1 − p.", sec: "s4" },
    { q: "What is the vulnerable time of CSMA, and what ratio should be kept small?",
      a: "It is Tp, one propagation delay. The ratio rho = Tp / Tfr should be kept at about 0.01 or less so the window is a negligible fraction of a frame.", sec: "s4" },
    { q: "What does CSMA/CD add to CSMA, and how does a station know a collision happened?",
      a: "It adds collision detection: the station keeps listening to the medium while it transmits and compares what it hears with what it sent. A mismatch means another station's signal is present, so the frame is aborted and sent again.", sec: "s5" },
    { q: "State the binary exponential backoff rule for CSMA/CD.",
      a: "After n collisions choose a random integer k uniformly from 0 through 2^n − 1 and wait k slot times. The window doubles with each collision, capped at n = 10 (0 through 1023), and the frame is dropped after 16 collisions.", sec: "s5" },
    { q: "Why does Ethernet impose a 64-byte minimum frame size?",
      a: "A frame must still be in progress after one round-trip propagation time, 2 × Tp, so the sender is still listening when a collision can return. At 10 Mbps with 2 × Tp = 51.2 microseconds, that gives 512 bits = 64 bytes.", sec: "s5" },
    { q: "Name CSMA/CA's three collision-avoidance strategies.",
      a: "The interframe space (an idle channel still requires a wait before transmitting), the contention window (choose a random number of slots to wait), and acknowledgments (a positive ACK plus a time-out timer proves the frame arrived).", sec: "s6" },
    { q: "Distinguish SIFS from DIFS.",
      a: "SIFS is the short interframe space, used for control and acknowledgment frames inside an existing exchange. DIFS is the longer DCF interframe space, waited out before a station starts a new exchange or sends an RTS. Because SIFS is shorter, a station mid-exchange always wins over one starting fresh.", sec: "s7" },
    { q: "What is the network allocation vector (NAV)?",
      a: "A timer set from the duration field of an overheard RTS or CTS. It records how long the medium is reserved, and a station checks its NAV before sensing the medium — if the NAV has not expired, it does not even try to sense. This is virtual carrier sensing.", sec: "s7" },
    { q: "Explain the hidden node problem and its standard solution.",
      a: "Two nodes can each reach the AP but not each other, so both sense an idle medium and transmit simultaneously, colliding at the AP. The solution is the RTS/CTS handshake: the CTS is broadcast by the AP and is heard by the hidden station, which then sets its NAV and defers.", sec: "s8" },
    { q: "How does the exposed node problem differ from the hidden node problem?",
      a: "Hidden node is a false negative: the medium is busy but the station thinks it is idle, so it transmits and ruins a frame. Exposed node is a false positive: the station hears a transmission that would not have interfered, wrongly defers, and idles the channel unnecessarily.", sec: "s8" },
    { q: "How does the reservation method divide time?",
      a: "Time is divided into intervals, and a reservation frame precedes the data frames in each interval. With N stations there are exactly N reservation minislots, one per station, and a station claims its own minislot to announce that it has data to send.", sec: "s9" },
    { q: "Distinguish the select function from the poll function in polling.",
      a: "Select is used when the primary has something to send: it alerts a secondary, gets a ready acknowledgment, sends data, then waits for an ACK. Poll is used to solicit data: the primary asks each secondary in turn, and a secondary replies NAK if it has nothing or sends its data and waits for an ACK.", sec: "s9" },
    { q: "What is the chief drawback of polling, and what is the chief drawback of token passing?",
      a: "Polling fails entirely if the primary station fails, and it wastes time polling idle secondaries. Token passing requires token management, because a lost or duplicated token must be detected and regenerated or access stops.", sec: "s9" },
    { q: "What is the difference between FDMA and FDM?",
      a: "FDM is a physical-layer multiplexing technique that uses a physical multiplexer to shift and combine low-bandwidth channels into one high-bandwidth bandpass signal. FDMA is a data-link access method in which each station's own data-link layer drives its physical layer to emit a bandpass signal, with no physical multiplexer involved.", sec: "s10" },
    { q: "What is the main problem with TDMA and how is it addressed?",
      a: "Synchronization between stations, aggravated by propagation delay, so a guard time is inserted at the start of each slot. Bit-level synchronization is a separate problem, addressed with preamble (synchronization) bits at the head of each slot.", sec: "s10" },
    { q: "How does CDMA encode and decode a bit?",
      a: "To send bit 1, multiply the station's orthogonal chip sequence by +1; for bit 0 multiply by −1; to stay idle, contribute nothing. The medium carries the chip-by-chip sum. The receiver dots the composite with the target's sequence and divides by the number of chips, giving a positive value for 1 and a negative value for 0.", sec: "s11" },
    { q: "Why must CDMA chip sequences be orthogonal?",
      a: "Because orthogonality makes the decoder work without coordination: a sequence dotted with itself gives N while two different sequences dot to 0, so every other station's contribution vanishes in the dot product and only the target station's bit survives.", sec: "s11" },
  ],
  quiz: [
    { q: "A shared link on which every transmission reaches all attached stations is best described as:",
      choices: ["A point-to-point link", "A multi-point or broadcast link", "A dedicated circuit", "A simplex channel"],
      answer: 1,
      why: "The slides define a link used by nodes or stations in common as a multi-point or broadcast link, and that is exactly what creates the need for MAC protocols.", sec: "s1" },
    { q: "What is the vulnerable time of pure ALOHA, in units of the frame time Tfr?",
      choices: ["0.5 × Tfr", "1 × Tfr", "2 × Tfr", "4 × Tfr"],
      answer: 2,
      why: "Pure ALOHA never senses the channel, so a frame can be destroyed by a competitor starting anywhere from one frame time before to one frame time after it — a window of 2 × Tfr.", sec: "s3" },
    { q: "The maximum throughput of slotted ALOHA is approximately:",
      choices: ["18.4 percent, at G = 0.5", "36.8 percent, at G = 1", "50 percent, at G = 0.5", "100 percent, at G = 1"],
      answer: 1,
      why: "Slotted ALOHA follows S = G·e^(−G), which peaks at 1/e ≈ 36.8 percent when the offered load G equals 1 frame per frame time.", sec: "s3" },
    { q: "Pure ALOHA reaches its maximum throughput of about 18.4 percent at what offered load?",
      choices: ["G = 0.25", "G = 0.5", "G = 1", "G = 2"],
      answer: 1,
      why: "S = G·e^(−2G) is maximized where its derivative vanishes, at G = 0.5, giving S = 0.5 × e^(−1) ≈ 0.184, or 18.4 percent.", sec: "s3" },
    { q: "Why can CSMA reduce but not eliminate collisions?",
      choices: ["Because stations forget the persistence rule", "Because propagation delay lets a station sense an idle medium just before another station's first bit arrives", "Because the medium is unidirectional", "Because acknowledgments are never used"],
      answer: 1,
      why: "Carrier sense is defeated by propagation delay: the first bit takes time to reach every station, so a distant station can find the channel apparently idle and transmit into the incoming frame.", sec: "s4" },
    { q: "Which persistence method transmits immediately, with probability 1, as soon as the medium goes idle?",
      choices: ["Non-persistent", "p-persistent", "1-persistent", "Slotted persistent"],
      answer: 2,
      why: "1-persistent CSMA senses continuously and pounces the instant the medium becomes free. That wastes no idle time but maximizes the chance that several waiting stations collide.", sec: "s4" },
    { q: "The vulnerable time of CSMA is:",
      choices: ["2 × Tfr", "1 × Tfr", "Tp, one propagation delay", "2 × Tp, one round trip"],
      answer: 2,
      why: "Because a CSMA station senses first, the only window in which it can be fooled is the time for the first bit to cross the medium — a single propagation delay Tp, unrelated to frame length.", sec: "s4" },
    { q: "After the third collision in CSMA/CD binary exponential backoff, the station chooses k from:",
      choices: ["{0, 1}", "{0, 1, 2, 3}", "{0 … 7}", "{0 … 15}"],
      answer: 2,
      why: "The range after n collisions is 0 through 2^n − 1. For n = 3 that is 2^3 = 8 slots, so k ranges over 0 through 7.", sec: "s5" },
    { q: "Why does CSMA/CD require a minimum frame size?",
      choices: ["To carry the 48-bit address", "To keep the sender transmitting for one full round-trip time so a collision can be detected", "To allow for the preamble", "To match the slot time of the contention window"],
      answer: 1,
      why: "A station must still be transmitting after 2 × Tp, otherwise it will have stopped listening before the collision signal returns. Minimum length equals 2 × Tp × R bits — 512 bits, or 64 bytes, on classic 10 Mbps Ethernet.", sec: "s5" },
    { q: "Which of the following is NOT one of CSMA/CA's three collision-avoidance strategies?",
      choices: ["The interframe space", "The contention window", "Acknowledgments", "The jam signal"],
      answer: 3,
      why: "The jam signal belongs to CSMA/CD, where a colliding station broadcasts noise to alert everyone. CSMA/CA's trio is the interframe space, the contention window, and acknowledgments.", sec: "s6" },
    { q: "Why is SIFS shorter than DIFS?",
      choices: ["Because control frames are smaller", "So a station already inside an exchange always wins the medium against a station trying to start a new one", "Because wireless slots are 50 microseconds", "To make the NAV expire sooner"],
      answer: 1,
      why: "The timing hierarchy itself enforces priority. A station resuming an exchange waits only SIFS, so it beats any station that must wait the longer DIFS before starting fresh.", sec: "s7" },
    { q: "The NAV timer in 802.11 is set from:",
      choices: ["The acknowledgment's sequence number", "The duration field carried in an RTS or CTS frame", "The station's own backoff counter", "The offset of the contention window"],
      answer: 1,
      why: "An RTS announces how long its sender needs the medium, and the corresponding CTS repeats that duration. Stations that overhear either frame load that duration into their NAV and defer until it expires.", sec: "s7" },
    { q: "Stations A and C can each reach the access point but not each other. Both sense an idle medium and transmit, and their frames collide at the AP. This is:",
      choices: ["The exposed node problem", "The hidden node problem", "A capture effect", "A collision detection failure"],
      answer: 1,
      why: "The hidden node problem is exactly this asymmetry of radio range: carrier sense cannot help because the interfering station's signal never reaches the sender. The RTS/CTS handshake, with the AP's broadcast CTS, is the standard remedy.", sec: "s8" },
    { q: "In the reservation method with N stations, how many reservation minislots does the reservation frame contain?",
      choices: ["As many as there are pending data frames", "Exactly N, one per station", "Always one shared minislot", "2N, for reservations and acknowledgments"],
      answer: 1,
      why: "The reservation frame carries exactly N minislots when the system has N stations, one in a fixed position for each. A station claims its own minislot to announce that it will send data afterwards.", sec: "s9" },
    { q: "Which statement correctly distinguishes FDMA from FDM?",
      choices: ["FDMA uses a physical multiplexer; FDM does not", "FDM is a physical-layer multiplexing technique; FDMA is a data-link access method with no physical multiplexer", "FDMA operates in the physical layer only", "FDM assigns a band to each station for the whole session"],
      answer: 1,
      why: "FDM combines low-bandwidth channels onto one high-bandwidth link using a physical multiplexer that shifts each channel's band. FDMA is the MAC-layer access method in which each station's data-link layer drives its own physical layer to emit a bandpass signal.", sec: "s10" },
    { q: "In CDMA with 4-chip sequences, a station sending bit 0 encodes it as:",
      choices: ["Its chip sequence multiplied by +1", "Its chip sequence multiplied by −1", "All zeros", "The complement of its chip sequence reversed in time"],
      answer: 1,
      why: "A 1 bit is encoded as +1 times the chip sequence and a 0 bit as −1 times it. Multiplying by −1 flips the sign of every chip, and the decoder recovers a negative value, which it reads as 0.", sec: "s11" },
    { q: "Four CDMA stations produce the composite (1, 1, −1, 3) using chip sequences (1,1,1,1), (1,−1,1,−1), (1,1,−1,−1) and (1,−1,−1,1). What is station 4's bit?",
      choices: ["0, because the dot product is negative", "1, because the dot product is 4 and 4/4 = 1", "Silent, because the dot product is 0", "Cannot be determined without the other stations' data"],
      answer: 1,
      why: "Dotting the composite with station 4's sequence (1, −1, −1, 1) gives 1 − 1 + 1 + 3 = 4. Dividing by the chip count N = 4 gives +1, which decodes to bit 1 — the other stations cancel out because the sequences are orthogonal.", sec: "s11" },
  ],
});
