window.NSCOM_MODULES = window.NSCOM_MODULES || [];
window.NSCOM_MODULES.push({
  id: "m06",
  num: 6,
  title: "Error Detection",
  accent: "#e8d44d",
  icon: `<svg viewBox="0 0 32 32" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"><path d="M6 12V6h6M26 12V6h-6M6 20v6h6M26 20v6h-6"/><path d="M3 16h26" stroke-width="1.4"/><circle cx="9" cy="16" r="1.6"/><circle cx="16" cy="16" r="1.6"/><path d="M20.5 9.5l2.5 2.5 4.5-5" stroke-width="2.2"/><path d="M23 9h3" stroke-width="0"/></svg>`,
  summary:
    "Transmitted bits can be corrupted by interference, so data-communications systems add redundant bits that let the receiver decide whether what arrived is what was sent. This module covers single-bit versus burst errors and why bursts dominate real links; the redundancy principle behind every detection scheme; block coding and Hamming distance, including the minimum distance needed to detect d errors versus to correct d errors; simple and two-dimensional parity checks and exactly what each can and cannot catch; the Internet checksum worked step by step with one's-complement arithmetic on the word NSCOM3; and the cyclic redundancy check — polynomial representation, generator polynomials, modulo-2 long division, why leading zeros must never be stripped, worked CRC examples, the receiver's whole-codeword verification, and the common polynomials CRC-12, CRC-16, CRC-ITU and CRC-32.",
  sections: [
    {
      id: "s1",
      title: "Introduction: Why Errors Happen",
      body: [
        {
          type: "fig",
          fig: "m06-p01-error-detection",
          caption: "Slide: Error Detection — Parity, CRC and Checksum.",
        },
        {
          type: "list",
          items: [
            "Data **can be corrupted** in transit — interference acts on the physical signal.",
            "Causes: voltage spikes, crosstalk, noise, and attenuation over distance.",
            "Some applications **must** detect errors; a few must also correct them.",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "what causes the interference",
          body: [
            {
              type: "p",
              text: "Data can be corrupted during transmission. Whenever bits flow from one point to another they are subject to unpredictable changes because of interference: a voltage spike couples into a copper pair, a motor starts nearby, a cosmic ray flips a stored bit, a radio link fades. The receiver therefore cannot simply assume that the bits it recovers are the bits that were sent. Some applications require that errors be detected and corrected — a file transfer must not silently deliver wrong bytes, a TCP segment must not be accepted with a corrupted header, and a storage device must not return damaged data as if it were good.",
            },
            {
              type: "list",
              items: [
                "Data can be corrupted during transmission.",
                "The cause is interference acting on the physical signal.",
                "Some applications require that errors be detected and corrected.",
                "Detection answers the question 'did anything change?'; correction answers 'what changed, and where?'.",
              ],
            },
            {
              type: "p",
              text: "It is worth separating the two responsibilities at the outset, because the entire module is organised around the difference. Detection is a yes/no decision: the receiver compares what it received against some redundant information the sender computed and concludes either 'this looks right' or 'this looks wrong'. Correction is strictly more informative: the receiver must determine the number of corrupted bits and, more importantly, their exact location in the message so that it can flip them back. Everything a detection or correction scheme does, it does by spending bandwidth on redundancy — extra bits that carry no user data but make the user data checkable.",
            },
            {
              type: "table",
              head: ["Question", "Scheme class", "Receiver output", "Cost"],
              rows: [
                ["Did any error occur?", "Error detection", "Accept or reject", "Small redundancy, plus retransmission when rejected"],
                ["How many bits, and where?", "Error correction", "The repaired message", "Much larger redundancy"],
              ],
            },
            {
              type: "note",
              text: "Exam framing: if the receiver can only say 'wrong', the scheme is detection and the fix is retransmission (ARQ). If the receiver can name the corrupted bit positions, the scheme is correction (FEC) and no retransmission is needed — but the redundancy cost is far higher.",
            },
          ],
        },
      ],
    },
    {
      id: "s2",
      title: "Types of Error: Single-Bit and Burst",
      body: [
        {
          type: "fig",
          fig: "m06-p04-single-bit-error",
          caption: "Slide: Single Bit Error — one bit of the data unit is inverted.",
        },
        {
          type: "list",
          items: [
            "**Single-bit error**: exactly one bit in the data unit is inverted.",
            "**Burst error**: two or more bits are inverted within a short window.",
            "Burst bits need not be adjacent — they only need to fall close together in the transmission.",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "how bursts really work",
          body: [
            {
              type: "p",
              text: "A single-bit error means that only 1 bit of a given data unit — such as a byte, character, or packet — is changed from 1 to 0 or from 0 to 1. A burst error means that 2 or more bits in the data unit have changed from 1 to 0 or from 0 to 1. The single-bit error is the textbook's simplest case, but it is not the common case in real links: interference usually lasts for a finite interval, and every bit that is on the wire during that interval can be affected, so errors arrive in clusters.",
            },
            {
              type: "list",
              items: [
                "Single-bit error: exactly 1 bit of the data unit is inverted (1→0 or 0→1).",
                "Burst error: 2 or more bits of the data unit are inverted.",
                "A burst error does not require the corrupted bits to be consecutive — they must merely fall within a short window of the transmission.",
                "The length of the burst is measured from the first corrupted bit to the last corrupted bit, inclusive.",
              ],
            },
            {
              type: "p",
              text: "The standard textbook definition measures the burst by the span between the first and last corrupted bit, not by the count of corrupted bits. A burst of length B may therefore contain anywhere from 2 to B corrupted bits: the bits inside the span that happen to be unaffected are still counted as part of the burst. So a burst of length 8 that changes only two bits — the first and the last of the span — is entirely possible, and it is still called an 8-bit burst. This is why burst length is the honest way to describe noisy links: it says how long the interference lasted, not merely how many bits it managed to flip.",
            },
            {
              type: "table",
              head: ["Data unit", "Bits sent", "Received", "Error type", "Burst length"],
              rows: [
                ["Byte", "00000000", "00010000", "Single-bit", "—"],
                ["Byte", "00000000", "00011000", "Burst", "2"],
                ["Byte", "00000000", "00111000", "Burst", "3"],
                ["Byte", "01000010", "00000010", "Burst", "2 (bits 1 and 2 both flipped)"],
                ["Byte", "00000000", "11000111", "Burst", "8"],
              ],
            },
            {
              type: "p",
              text: "Thermal noise flips an isolated bit here and there, which is why the single-bit model is a fair description of a low-noise channel operating well below its Shannon limits. Most real impairment, however, comes in episodes. Impulse noise from lightning or a switching transient lasts for microseconds; at 1 Mbps that single spike sits across an entire microsecond and therefore corrupts a whole run of consecutive bits. Induced noise from a motor is periodic but locally coherent. On a serial link at 10 Mbps, a 1 ms disturbance stretches over 10,000 bit periods, so a single physical event wipes out a 10,000-bit burst. That is precisely why every practical scheme in this module must be good at catching bursts, and why schemes are judged specifically on their burst-detecting capability rather than only on how many isolated bit errors they can absorb.",
            },
            {
              type: "example",
              text: "A 1 Mbps link suffers a 2 ms burst of impulse noise from a nearby relay. How many bit periods fall inside the burst, and what would a receiver see if the interference affected every bit in that window?",
              steps: [
                "Bit interval = 1 / bit rate = 1 / 1,000,000 s = 1 µs per bit.",
                "Number of bits inside 2 ms = 2 ms / 1 µs = 2,000 bits.",
                "So the disturbance spans a 2,000-bit burst — not a single-bit error.",
                "If all 2,000 bits are flipped, the burst length is 2,000; if the noise only flips the first and last, the burst length is still measured as 2,000 from first to last corrupted bit.",
              ],
            },
            {
              type: "note",
              text: "Why this matters for design: a scheme that can only catch a single-bit error is useless on a medium where a relay click destroys 2,000 consecutive bits. This is the argument that motivates cyclic redundancy checks, whose behaviour under bursts is provably strong.",
            },
          ],
        },
      ],
    },
    {
      id: "s3",
      title: "The Redundancy Principle",
      body: [
        {
          type: "fig",
          fig: "m06-p01-error-detection",
          caption: "Slide: redundancy is the central concept in detecting or correcting errors.",
        },
        {
          type: "list",
          items: [
            "**Redundancy** is the central idea: send extra bits that carry no new information but make errors visible.",
            "The sender **adds** them, the receiver **removes and uses** them.",
            "**Detection** asks only *did an error occur?* **Correction** asks *which bit, exactly?*",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "detect vs correct",
          body: [
            {
              type: "p",
              text: "The central concept in detecting or correcting errors is redundancy. To detect or correct errors, we need to send extra bits with our data — redundant bits that add no new information but make the data checkable. These redundant bits are added by the sender and removed by the receiver; the receiver uses them to decide what happened to the message. In error detection we are only looking to see if any error has occurred. In error correction we need to know the exact number of bits that are corrupted and, more importantly, their location in the message.",
            },
            {
              type: "list",
              items: [
                "Redundancy is the central concept of error detection and correction.",
                "Redundant bits are added by the sender and removed by the receiver.",
                "Error detection asks only whether any error has occurred.",
                "Error correction requires the number of corrupted bits and their location in the message.",
              ],
            },
            {
              type: "p",
              text: "A clean way to see why redundancy works is to count possibilities. If a sender wishes to transmit k data bits, there are 2^k different messages it might mean. If it transmits n > k bits instead, there are 2^n distinct bit patterns available, but only 2^k of them are ever sent. The receiver can therefore define a rule: 'any pattern I receive that is not one of the 2^k legal patterns must have come from an error.' The number of legal patterns is unchanged while the space of possible received patterns has grown, so errors have somewhere to land where they become visible. That is the whole of error detection in one sentence, and every scheme in this module — parity, two-dimensional parity, checksum, CRC — is a concrete way of choosing which n-bit patterns count as legal.",
            },
            {
              type: "formula",
              tex: "\\text{redundant bits } r = n - k \\qquad \\text{legal patterns } = 2^{k} \\quad \\text{of} \\quad 2^{n}",
              text: "If a k-bit message is sent as an n-bit codeword, the scheme spends r equals n minus k redundant bits, and only 2 to the k of the 2 to the n possible received patterns are legal. The larger the gap, the more errors can be caught, at the cost of sending r extra bits per word.",
            },
            {
              type: "example",
              text: "A data unit carries k = 7 data bits and the scheme appends r = 1 redundant bit. How many legal patterns are there out of the total pattern space, and what fraction of all possible received patterns is that?",
              steps: [
                "Total transmitted length n = k + r = 7 + 1 = 8 bits.",
                "Legal patterns = 2^k = 2^7 = 128.",
                "Total possible received patterns = 2^n = 2^8 = 256.",
                "So 128 of the 256 possible 8-bit patterns are legal — exactly half. Any received pattern that is not one of those 128 is detected as an error.",
              ],
            },
            {
              type: "note",
              text: "Detection is probabilistic, not magical. Redundancy lets the receiver spot most errors, but a sufficiently unlucky corruption can land the codeword exactly on another legal pattern and slip through undetected. The strength of a scheme is measured by how rare that unlucky event is.",
            },
          ],
        },
      ],
    },
    {
      id: "s4",
      title: "Block Coding and Hamming Distance",
      body: [
        {
          type: "fig",
          fig: "m06-p11-crc-computation",
          caption: "Slide: CRC computation — the same block-coding machinery, applied with polynomial division.",
        },
        {
          type: "list",
          items: [
            "**Block coding**: k data bits (**dataword**) + r redundant bits = n bits (**codeword**), where **n = k + r**.",
            "**Hamming distance** between two codewords = how many bits differ.",
            "The **minimum** Hamming distance across the code set fixes what the scheme can detect and correct.",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "Hamming distance maths",
          body: [
            {
              type: "p",
              text: "Block coding divides the message into blocks of k bits, each called a dataword, and adds r redundant bits to produce an n-bit codeword, where n = k + r. This is the general framework inside which simple parity, two-dimensional parity and CRC all operate. The single most useful measure of a block code's power is its Hamming distance: the number of bit positions in which two codewords differ. The Hamming distance between two words is found by exclusive-ORing them and counting the 1s in the result.",
            },
            {
              type: "formula",
              tex: "d(x, y) = \\#\\{\\, i : x_i \\ne y_i \\,\\} \\qquad d_{\\min} = \\min_{a \\ne b} d(a, b)",
              text: "The Hamming distance between two words is the number of positions at which they differ — equivalently the number of 1 bits in their XOR. The minimum Hamming distance of a code is the smallest such distance over all pairs of distinct legal codewords.",
            },
            {
              type: "p",
              text: "The minimum Hamming distance d_min of a code determines exactly what the code can do. To detect up to d errors, the minimum Hamming distance must be at least d + 1. To correct up to d errors, the minimum Hamming distance must be at least 2d + 1. The reason is geometric. Every legal codeword occupies a point in the n-bit space, and an error of one bit moves the received word to an adjacent point. If d_min = 2, no two legal codewords are adjacent, so a single-bit error can never land on another legal codeword — it always lands in the gap, so it is always detectable. But two errors could land on a legal codeword (that is, one legal word is two steps from another), so a two-bit error can go undetected. If d_min = 3, single-bit errors from different codewords land in disjoint neighbourhoods, so the receiver can identify which codeword was intended and correct the bit — up to floor(d_min / 2) errors.",
            },
            {
              type: "list",
              items: [
                "Detecting d errors requires d_min ≥ d + 1.",
                "Correcting d errors requires d_min ≥ 2d + 1.",
                "A code can correct up to floor(d_min / 2) errors.",
                "The parity-check code has d_min = 2, so it detects single-bit errors but cannot correct them.",
              ],
            },
            {
              type: "table",
              head: ["Minimum Hamming distance", "Can detect", "Can correct", "Example scheme"],
              rows: [
                ["d_min = 1", "Nothing", "Nothing", "No redundancy at all"],
                ["d_min = 2", "Up to 1 error", "Nothing", "Simple parity check"],
                ["d_min = 3", "Up to 2 errors", "Up to 1 error", "Two-dimensional parity, Hamming code"],
                ["d_min = 4", "Up to 3 errors", "Up to 1 error", "Extended Hamming code"],
                ["d_min = 5", "Up to 4 errors", "Up to 2 errors", "Double-error-correcting codes"],
              ],
            },
            {
              type: "example",
              text: "The 2-bit code {00, 01, 10, 11} can never detect anything. What is its minimum Hamming distance, and how much redundancy does a code need to detect two errors?",
              steps: [
                "Compare the closest pair: d(00, 01) = 1, so d_min = 1.",
                "With d_min = 1, any single-bit error produces another legal codeword, so no error can be detected.",
                "To detect d = 2 errors we need d_min ≥ d + 1 = 3.",
                "For a k-bit dataword, an n-bit codeword whose d_min is 3 costs r = n − k redundant bits; the simplest construction is parity for d = 1 (d_min = 2) plus one more check bit to lift d_min to 3.",
              ],
            },
            {
              type: "example",
              text: "Find the Hamming distance between 10101 and 11010, and state whether a code containing only these two words could detect a 2-bit error.",
              steps: [
                "XOR the two words: 10101 ⊕ 11010 = 01111.",
                "Count the 1s in the result: four.",
                "So d(10101, 11010) = 4.",
                "A code with only these two codewords has d_min = 4, so it detects up to 4 − 1 = 3 errors and corrects up to floor(4 / 2) = 2 errors.",
              ],
            },
            {
              type: "note",
              text: "Remember the asymmetry: a code that detects d errors is not automatically able to correct them. Correction demands roughly twice the distance headroom, because the receiver must not merely notice that something changed but decide which legal codeword was the intended one.",
            },
          ],
        },
      ],
    },
    {
      id: "s5",
      title: "Simple Parity Check",
      body: [
        {
          type: "list",
          items: [
            "**Simple parity**: append **one** redundant bit so the total number of 1s is even (or odd).",
            "**n = k + 1**, and the minimum Hamming distance is **d_min = 2**.",
            "Sender and receiver must agree on even or odd **before** any data flows.",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "worked parity",
          body: [
            {
              type: "p",
              text: "A simple parity-check code is a single-bit error-detecting code in which n = k + 1, with d_min = 2. Exactly one redundant bit is appended. The sender and receiver must agree on even or odd parity: under even parity the appended bit is chosen so that the total number of 1s in the codeword is even; under odd parity the total is made odd. When the receiver gets the codeword it counts the 1s and checks that the agreed parity still holds.",
            },
            {
              type: "list",
              items: [
                "Simple parity: n = k + 1, exactly one redundant bit.",
                "Minimum Hamming distance d_min = 2.",
                "Sender and receiver must agree on even or odd parity before any data flows.",
                "Even parity makes the total count of 1s even; odd parity makes it odd.",
              ],
            },
            {
              type: "formula",
              tex: "\\text{even parity bit} = \\left( \\sum_{i=1}^{k} x_i \\right) \\bmod 2 \\qquad \\text{odd parity bit} = 1 - \\left( \\sum_{i=1}^{k} x_i \\right) \\bmod 2",
              text: "Under even parity the redundant bit is the XOR (modulo-2 sum) of all the data bits, so the codeword has an even number of 1s. Under odd parity the bit is the complement of that sum, so the codeword has an odd number of 1s.",
            },
            {
              type: "table",
              head: ["Dataword", "Number of 1s", "Even-parity codeword", "Odd-parity codeword"],
              rows: [
                ["1011001", "4", "10110010", "10110011"],
                ["1100111", "5", "11001110", "11001111"],
                ["0000000", "0", "00000000", "00000001"],
                ["1111111", "7", "11111111", "11111110"],
              ],
            },
            {
              type: "example",
              text: "The dataword 1100111 is transmitted with even parity appended. What is the codeword, and what does the receiver conclude if it receives 11001110 and if it receives 11011110?",
              steps: [
                "Even parity means the codeword's total number of 1s must be even. The dataword 1100111 has five 1s (odd), so the parity bit must be 1. Codeword = 11001111.",
                "Received 11001110: count the 1s = 6, which is even, so parity holds and the word is accepted as error-free.",
                "Received 11011110: the dataword now has six 1s, plus the parity bit 1 gives an odd total of 7. Parity fails, the word is rejected.",
                "Compare the two received words: 11001110 and 11011110 differ in exactly one bit, so the rejection in the second case was caused by a single-bit error — exactly what parity is designed to catch.",
              ],
            },
            {
              type: "p",
              text: "Simple parity has two hard limitations that exam questions target directly. First, it detects only errors in which an odd number of bits are flipped. If two bits change, the number of 1s changes by an even amount (two increments, two decrements, or one of each cancelling), so the parity keeps holding and the corrupted word is accepted. Second, it cannot correct anything at all: knowing only that the parity is wrong tells the receiver that some odd number of bits changed, but not which bits or how many. With d_min = 2 there is no way to identify the intended codeword, so a failing parity bit always means discard and ask for retransmission, never repair.",
            },
            {
              type: "table",
              head: ["Bits flipped", "Parity changes?", "Detected?", "Corrected?"],
              rows: [
                ["1", "Yes (odd change)", "Yes", "No"],
                ["2", "No (even change)", "No", "No"],
                ["3", "Yes (odd change)", "Yes", "No"],
                ["4", "No (even change)", "No", "No"],
                ["5", "Yes (odd change)", "Yes", "No"],
              ],
            },
            {
              type: "note",
              text: "Mnemonic: parity catches odd numbers of flipped bits only, and it never repairs anything. If a question says two or four bits were corrupted, parity will accept the word silently — that is the failure mode to name.",
            },
          ],
        },
      ],
    },
    {
      id: "s6",
      title: "Two-Dimensional Parity Check",
      body: [
        {
          type: "fig",
          fig: "m06-p08-two-dimensional-parity-check",
          caption: "Slide: Two Dimensional Parity Check — row parity plus column parity.",
        },
        {
          type: "list",
          items: [
            "**Two-dimensional parity** arranges data in a grid and computes parity for **every row and every column**.",
            "The row and column parities **intersect** at the bad bit — so this scheme can **correct**, not just detect.",
            "That correction ability is unique among the schemes in this module.",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "how the correction works",
          body: [
            {
              type: "p",
              text: "The two-dimensional parity check allows detection of error bits and, uniquely among the schemes in this module, correction of the error bit. It uses a row parity and a column parity to correct errors. The data are arranged as a table of rows and columns. The sender computes a parity bit for each row and a parity bit for each column, and transmits the data together with the row and column parity bits — a rectangle of data surrounded by a cross of check bits. The receiver recomputes both sets of parities and compares.",
            },
            {
              type: "list",
              items: [
                "Arrange the data as a two-dimensional grid of rows and columns.",
                "Compute one parity bit per row and one parity bit per column.",
                "Transmit the data plus the row parities plus the column parities.",
                "All parities must agree with the agreed convention (usually even parity).",
              ],
            },
            {
              type: "p",
              text: "The elegance of the scheme lies in the intersection rule. Suppose exactly one bit is corrupted. That single flip breaks the parity of its row and the parity of its column — and only that one row and that one column. The receiver therefore sees two failing parity checks, one horizontal and one vertical, and their intersection is precisely the corrupted bit. The receiver flips it back and the message is repaired without retransmission. If the flip had broken more than one row or more than one column, the intersection would be ambiguous, which is exactly why a single-bit error is the case the scheme can correct. The scheme can also detect, though not correct, many multi-bit errors, because additional failures show up as inconsistency in the failing rows and columns.",
            },
            {
              type: "table",
              head: ["Situation at receiver", "Row parities failing", "Column parities failing", "Verdict"],
              rows: [
                ["No error", "0", "0", "Accept — data good"],
                ["Single-bit error", "1", "1", "Correct: flip the bit at the intersection, then accept"],
                ["Two bits in different rows and columns", "2", "2", "Detected but ambiguous — reject and retransmit"],
                ["Two bits in the same row", "1", "2", "Detected but cannot be corrected by intersection alone"],
                ["Burst covering a full row", "1", "all", "Detected — reject and retransmit"],
              ],
            },
            {
              type: "example",
              text: "The 3×4 data block below is to be protected by two-dimensional even parity. The rows are 1010, 0110 and 1101. Compute the row parity bits, the column parity bits, and show the transmitted block. Then determine what the receiver does if the bit in row 2, column 3 is flipped in transit.",
              steps: [
                "Row 1: 1010 has two 1s (even), so its even-parity bit is 0.",
                "Row 2: 0110 has two 1s (even), so its parity bit is 0.",
                "Row 3: 1101 has three 1s (odd), so its parity bit is 1.",
                "Column 1 holds 1, 0, 1 → two 1s, so column parity 0.",
                "Column 2 holds 0, 1, 1 → two 1s, so column parity 0.",
                "Column 3 holds 1, 1, 0 → two 1s, so column parity 0.",
                "Column 4 holds 0, 0, 1 → one 1, so column parity 1.",
                "Transmitted block: rows 1010|0, 0110|0, 1101|1, with a final parity row 0001|1.",
                "If row 2, column 3 is flipped, row 2's parity now fails and column 3's parity now fails. Row 2 and column 3 intersect at the flipped bit, so the receiver flips it back and accepts the data with no retransmission.",
              ],
            },
            {
              type: "example",
              text: "Using the same 3×4 block, suppose instead that two bits in row 1 are flipped — positions (1,1) and (1,2). What does the receiver see, and what is the verdict?",
              steps: [
                "Two flips in the same row change the number of 1s in that row by an even amount, so row 1's row parity still holds.",
                "Column 1 now fails and column 2 now fails, so two column parities are wrong.",
                "The receiver therefore detects that something happened but the row 1 parity is fine, so the single-intersection rule does not apply.",
                "Verdict: error detected, but not correctable by the intersection rule — the block is rejected and retransmission is requested.",
              ],
            },
            {
              type: "note",
              text: "Two-dimensional parity is the cheapest scheme in this module that can actually correct a single-bit error. The trade-off is that it adds a parity bit per row and per column, so its overhead grows with the dimensions of the grid, and its correction power is limited to exactly the single-error case.",
            },
          ],
        },
      ],
    },
    {
      id: "s7",
      title: "Cyclic Redundancy Check: The Idea",
      body: [
        {
          type: "fig",
          fig: "m06-p11-crc-computation",
          caption: "Slide: CRC Computation — polynomial division attaching a remainder to the message.",
        },
        {
          type: "list",
          items: [
            "**CRC** treats the packet as one big **polynomial** whose coefficients are the bits.",
            "The sender **divides** the message polynomial by an agreed **generator** polynomial, using modulo-2 arithmetic.",
            "The **quotient is discarded**; only the **remainder** is kept — that remainder is the CRC.",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "why polynomials",
          body: [
            {
              type: "p",
              text: "The CRC error detection method treats the packet of data to be transmitted as a large polynomial. The transmitter takes the message polynomial and, using polynomial arithmetic, divides it by a given generating polynomial. The quotient is discarded but the remainder is attached to the end of the message. What is transmitted, therefore, is the original message followed by the CRC bits, and the CRC has exactly as many bits as the degree of the generator polynomial.",
            },
            {
              type: "list",
              items: [
                "The packet of data is treated as a large polynomial whose coefficients are the bits.",
                "The transmitter divides that message polynomial by a generator polynomial using polynomial arithmetic.",
                "The quotient is discarded.",
                "The remainder is attached to the end of the message and transmitted with it.",
              ],
            },
            {
              type: "p",
              text: "Any bit string can be read as a polynomial in a formal variable x. The leftmost bit is the highest-degree coefficient, and each successive bit is one degree lower; the final bit is the constant term. So the bit string 1011 represents 1·x³ + 0·x² + 1·x + 1 = x³ + x + 1. A coefficient of 1 means that power of x is present; a coefficient of 0 means it is absent. Crucially, the leading bit must be a 1 for the polynomial's degree to be stated correctly — this is the same 'never strip leading zeros' discipline that governs the long division itself. The degree of a polynomial equals the length of its bit pattern minus one.",
            },
            {
              type: "table",
              head: ["Bit pattern", "Polynomial", "Degree"],
              rows: [
                ["1", "1", "0"],
                ["10", "x", "1"],
                ["11", "x + 1", "1"],
                ["1011", "x³ + x + 1", "3"],
                ["10011", "x⁴ + x + 1", "4"],
                ["110101", "x⁵ + x⁴ + x² + 1", "5"],
              ],
            },
            {
              type: "p",
              text: "The generator polynomial is the divisor, and it is fixed and agreed in advance by both sender and receiver — it is part of the protocol specification, not something the sender chooses per packet. Its degree sets everything else: a generator of degree r produces an r-bit remainder, so the CRC field is r bits long, and the sender appends r zeros to the message before dividing to make room for that remainder. A degree-4 generator such as 10011 therefore yields a 4-bit CRC, and the codeword is four bits longer than the data. A degree-16 generator such as CRC-16 yields a 16-bit CRC, which is why CRC-16 protected frames are two bytes longer than their payload.",
            },
            {
              type: "formula",
              tex: "n_{\\text{codeword}} = k + r \\quad \\text{where } r = \\deg G(x) \\quad\\text{and}\\quad \\text{CRC bits} = r",
              text: "For a k-bit dataword and a generator polynomial of degree r, the codeword is k plus r bits: the original data followed by the r-bit remainder. The number of appended zeros before division is also r.",
            },
            {
              type: "example",
              text: "A protocol specifies a generator polynomial of degree 5, and each frame carries 500 data bits. How long is the CRC field, how many zeros are appended before division, and how long is the transmitted codeword?",
              steps: [
                "Degree r = 5, so the CRC field is 5 bits and the sender appends 5 zeros to the data before dividing.",
                "Transmitted codeword length = k + r = 500 + 5 = 505 bits.",
                "The 5 CRC bits are the remainder the division produces; the quotient is discarded.",
                "Overhead = 5 / 505 ≈ 0.99% of the transmitted bits — the redundancy this scheme costs.",
              ],
            },
            {
              type: "note",
              text: "Two things to keep straight: the number of appended zeros equals the degree of the generator, and the number of CRC bits in the codeword is also exactly the degree. Getting these mixed up is the classic cause of a wrong CRC answer.",
            },
          ],
        },
      ],
    },
    {
      id: "s8",
      title: "Modulo-2 Division and the Receiver Check",
      body: [
        {
          type: "fig",
          fig: "m06-p11-crc-computation",
          caption: "Slide: CRC computation by long-hand division with the remainder attached.",
        },
        {
          type: "list",
          items: [
            "**Modulo-2 division means subtraction is XOR** — no borrowing, no carries. This is where students slip.",
            "The sender transmits the message **with the remainder appended**.",
            "The receiver divides the whole codeword by the **same** generator: **remainder 0 → accept**, anything else → error.",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "step-by-step division",
          body: [
            {
              type: "p",
              text: "The receiver's side of CRC is the mirror image of the sender's, and it is the step students most often get wrong. The message with its remainder is transmitted to the receiver. The receiver divides the message and remainder — the whole codeword — by the same generating polynomial. If a remainder not equal to zero results, there was an error during transmission. If a remainder of zero results, there was no error during transmission. The receiver must divide the entire received codeword, not strip off the CRC and check it separately; the whole point is that the codeword as a whole is an exact multiple of the generator when no error occurred.",
            },
            {
              type: "list",
              items: [
                "The sender transmits the message with its remainder attached.",
                "The receiver divides the whole received codeword by the same generator polynomial.",
                "Remainder zero → no error detected → accept.",
                "Remainder non-zero → an error occurred during transmission → reject.",
              ],
            },
            {
              type: "p",
              text: "The reason the receiver expects zero is algebraic. The sender appends r zeros to the message polynomial M(x), giving M(x)·x^r, and divides it by the generator G(x). Polynomial division gives M(x)·x^r = Q(x)·G(x) + R(x), where R(x) is the remainder of degree less than r. The sender then transmits T(x) = M(x)·x^r + R(x). Substituting, T(x) = Q(x)·G(x) + R(x) + R(x). In modulo-2 arithmetic, adding a polynomial to itself cancels it exactly, since R(x) + R(x) = 0. Therefore T(x) = Q(x)·G(x): the transmitted codeword is an exact multiple of the generator, with remainder zero. That is the entire trick — the sender has made the codeword divisible by G(x), so any departure from divisibility at the receiver must have been introduced by the channel.",
            },
            {
              type: "formula",
              tex: "T(x) = M(x)\\,x^{r} + R(x) = Q(x)\\,G(x) \\quad\\Longrightarrow\\quad T(x) \\bmod G(x) = 0",
              text: "The transmitted codeword equals the message shifted up by r places plus the remainder, which equals the quotient times the generator. Because the remainder is added to itself and cancels in modulo-2 arithmetic, the codeword is an exact multiple of the generator and divides by it with zero remainder.",
            },
            {
              type: "p",
              text: "Modulo-2 arithmetic has only two operations among the bits: addition and subtraction are both exclusive-OR, with no carries and no borrows. 0 XOR 0 = 0, 0 XOR 1 = 1, 1 XOR 0 = 1, and 1 XOR 1 = 0 — so bits that match cancel and bits that differ survive. Long division works exactly like ordinary binary long division on paper, but at each step you bring down the divisor aligned under the leading 1 of the current working value and XOR instead of subtract. You repeat until no bit of the working value remains above the divisor's lowest position, and what is left in the low r positions is the remainder. Two rules are non-negotiable: the divisor must be aligned so its leftmost 1 sits under the current leading 1, and leading zeros in the working value must never be dropped, because dropping a zero changes which bit position is the leading one and throws off every subsequent alignment.",
            },
            {
              type: "example",
              text: "Perform the division for data 1101011011 and generator 10011 using modulo-2 long division, and write down the remainder and the transmitted codeword.",
              steps: [
                "Degree of generator 10011 is 4, so append four zeros: 11010110110000.",
                "Align 10011 under the leading 1 at position 1: 11010 (cancels) then 0 after XOR, brought down → 0011 0110110000, working value 00110110110000.",
                "Next, align under the leading 1 (position 5): XOR 00110 ⊕ 10011 = 10101 → working value 00000110110000 after the shift.",
                "Position 11: 11011 ⊕ 10011 = 01000 → working value 00000000001000.",
                "Position 20 has the trailing zero, so no XOR is applied.",
                "Remainder (lowest r = 4 positions) = 1110.",
                "Transmitted codeword = data followed by the remainder = 11010110111110.",
              ],
            },
            {
              type: "example",
              text: "Now verify the same codeword 11010110111110 at the receiver, dividing the whole codeword by the same generator 10011.",
              steps: [
                "Divide the entire codeword 11010110111110 by 10011 with no appended zeros — the zeros were already added at the sender.",
                "Perform the modulo-2 long division exactly as above, this time with the remainder already present in the low bits.",
                "The working value reduces to zeros in every bit position.",
                "Remainder = 0000.",
                "A remainder of zero means the codeword divided exactly by the generator, so no error was detected and the message is accepted.",
              ],
            },
            {
              type: "note",
              text: "Two traps in one. First, the receiver never strips the CRC before dividing — it divides the entire received codeword. Second, a remainder of 011 must be written as 011, not 11: leading zeros are real bit positions in the CRC field, and stripping them is as wrong as dropping a leading digit of a decimal remainder.",
            },
          ],
        },
      ],
    },
    {
      id: "s9",
      title: "Worked CRC Examples",
      body: [
        {
          type: "list",
          items: [
            "CRC only becomes reliable once the **subtraction-free long division** has been practised until nothing is guessed.",
            "Work the slides' examples end to end — the steps are mechanical and the marks are in showing them.",
            "The commonest error is losing place in the XOR alignment; line the divisor up under the leading 1 every time.",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "fully worked CRCs",
          body: [
            {
              type: "p",
              text: "CRC becomes reliable only once the subtraction-free long division has been practised enough that no step is guessed. The examples below are worked completely: first the slide's own example with P(x) = x⁵ + x⁴ + x² + 1 and M(x) = 1010011010, and then a second, smaller case from first principles. Every remainder in this section was checked arithmetically, and the leading zeros in each remainder are preserved in the answer as they must be.",
            },
            {
              type: "example",
              text: "Slide example: given P(x) = x⁵ + x⁴ + x² + 1 and message M(x) = 1010011010, calculate the remainder using long-hand division.",
              steps: [
                "Write the generator polynomial as bits: x⁵ + x⁴ + 0·x³ + x² + 0·x + 1 = 110101. Its degree is 5.",
                "Append five zeros to the message, since the degree is 5: 1010011010 + 00000 = 101001101000000.",
                "Divide 101001101000000 by 110101 using modulo-2 long division: at each step align 110101 under the current leading 1 and XOR.",
                "The working value reduces step by step until only the low 5 positions remain non-zero.",
                "Remainder = 10110 (5 bits, matching the generator's degree — note the leading 1 is a real, necessary bit).",
                "Transmitted codeword = message followed by remainder = 101001101010110.",
                "Receiver check: dividing 101001101010110 by 110101 gives remainder 00000, so the codeword is accepted.",
              ],
            },
            {
              type: "example",
              text: "Second worked example, small enough to do by hand: data 1010 with generator 1011 (that is, x³ + x + 1, degree 3). Find the CRC and the codeword.",
              steps: [
                "Degree of 1011 is 3, so append three zeros: 1010 + 000 = 1010000.",
                "Align 1011 under the leading 1 of 1010000: 1010 ⊕ 1011 = 0001, leaving 0001000.",
                "Bring the alignment down to the next leading 1, at position 4: 1000 ⊕ 1011 = 0011.",
                "No further 1s remain above the divisor's lowest position, so the division stops.",
                "Remainder = 011 — three bits, and the leading zero must be kept.",
                "Transmitted codeword = 1010 followed by 011 = 1010011.",
                "Receiver check: 1010011 divided by 1011 leaves remainder 000 — zero, so the word is accepted. If this remainder had come out as 11 instead of 011 the answer would have been wrong, because the CRC field is three bits wide and 11 is only two.",
              ],
            },
            {
              type: "example",
              text: "Corruption test on the previous example: the codeword 1010011 is sent, but the link flips bit 5 in transit so 1010111 arrives. Does the receiver catch it?",
              steps: [
                "Divide the received word 1010111 by 1011.",
                "XOR 1010 with 1011 → 0001; continue with the remaining bits 111.",
                "The working value does not reduce to zero.",
                "Remainder is non-zero, so the receiver rejects the frame. The CRC caught the single-bit corruption, as a degree-3 generator is guaranteed to catch any single-bit error.",
              ],
            },
            {
              type: "note",
              text: "Every remainder must be exactly deg(G) bits wide, leading zeros included. If your remainder is shorter than the degree, you have stripped a zero somewhere in the division — go back and redo it rather than padding the answer at the end, because the alignment may have been wrong too.",
            },
          ],
        },
      ],
    },
    {
      id: "s10",
      title: "Common CRC Polynomials",
      body: [
        {
          type: "list",
          items: [
            "Real protocols use fixed generators: **CRC-12**, **CRC-16**, **CRC-ITU (CCITT)**.",
            "The **degree decides the CRC width** — degree 16 gives a 16-bit CRC.",
            "**CRC-ITU** (x¹⁶+x¹⁵+x⁵+1) is the ITU-T standard for 8-bit characters.",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "choosing a generator",
          body: [
            {
              type: "p",
              text: "The slide lists the generator polynomials that appear in real protocols. CRC-12 is x¹² + x¹¹ + x³ + x² + x + 1. CRC-16 is x¹⁶ + x¹⁵ + x² + 1. CRC-CCITT — also called CRC-ITU, the polynomial standardised by the ITU-T — is x¹⁶ + x¹⁵ + x⁵ + 1. CRC-32 is x³² + x²⁶ + x²³ + x²² + x¹⁶ + x¹² + x¹¹ + x¹⁰ + x⁸ + x⁷ + x⁵ + x⁴ + x² + x + 1. The ATM CRC is x⁸ + x² + x + 1. Each of these is a specific, published bit pattern, not a free choice, and sender and receiver must use the same one or nothing will verify.",
            },
            {
              type: "list",
              items: [
                "CRC-12: x¹² + x¹¹ + x³ + x² + x + 1 — degree 12, gives a 12-bit CRC, used historically for 6-bit character protocols.",
                "CRC-16: x¹⁶ + x¹⁵ + x² + 1 — degree 16, gives a 16-bit CRC.",
                "CRC-ITU (CRC-CCITT): x¹⁶ + x¹⁵ + x⁵ + 1 — degree 16, the ITU-T standard for 8-bit characters.",
                "CRC-32: a degree-32 polynomial with many terms, used in Ethernet, ZIP archives and PNG images.",
                "ATM CRC: x⁸ + x² + x + 1 — degree 8, a compact 8-bit CRC for short ATM headers.",
              ],
            },
            {
              type: "p",
              text: "Generator polynomials are chosen for their mathematical properties, not for convenience. A generator of degree r detects all single-bit errors; it detects all burst errors of length r or less; and, if x + 1 is a factor of the generator, it detects all errors affecting an odd number of bits. An r-bit generator misses a burst of length exactly r + 1 only in the specific case where the error pattern is identical to the generator itself, and misses longer bursts only with a probability of roughly 2^−r. CRC-16, with its x + 1 factor and its degree of 16, therefore catches all single-bit errors, all bursts up to 16 bits, all odd-count errors, and all but about one in 65,536 longer bursts — which is why it was the workhorse of framed serial protocols for decades. CRC-32 pushes the escape probability down to about 2^−32, which is why Ethernet frames use it.",
            },
            {
              type: "table",
              head: ["Name", "Polynomial", "Degree", "CRC bits", "Typical use"],
              rows: [
                ["ATM CRC", "x⁸ + x² + x + 1", "8", "8", "Short ATM header protection"],
                ["CRC-12", "x¹² + x¹¹ + x³ + x² + x + 1", "12", "12", "6-bit character serial protocols"],
                ["CRC-16", "x¹⁶ + x¹⁵ + x² + 1", "16", "16", "Framed serial links, older LANs"],
                ["CRC-ITU (CRC-CCITT)", "x¹⁶ + x¹⁵ + x⁵ + 1", "16", "16", "ITU-T standard for 8-bit characters"],
                ["CRC-32", "x³² + x²⁶ + x²³ + x²² + x¹⁶ + x¹² + x¹¹ + x¹⁰ + x⁸ + x⁷ + x⁵ + x⁴ + x² + x + 1", "32", "32", "Ethernet, ZIP, PNG"],
              ],
            },
            {
              type: "example",
              text: "Convert the CRC-16 polynomial x¹⁶ + x¹⁵ + x² + 1 into its bit pattern and state its degree, then do the same for CRC-ITU.",
              steps: [
                "CRC-16 has terms at powers 16, 15, 2 and 0, so the bit string has 1s at positions corresponding to those powers and 0s elsewhere.",
                "Writing it out: 1 1 000000000000 1 0 1 = 11000000000000101.",
                "Count the bits: 17 bits, so the degree is 17 − 1 = 16. The CRC field is therefore 16 bits.",
                "CRC-ITU (CRC-CCITT) x¹⁶ + x¹⁵ + x⁵ + 1 has 1s at powers 16, 15, 5 and 0: 11000000000100001.",
                "Again 17 bits, so degree 16 and a 16-bit CRC — CRC-16 and CRC-ITU are the same width but different polynomials, and they are not interchangeable.",
              ],
            },
            {
              type: "note",
              text: "Exam point: the width of the CRC field always equals the degree of the generator polynomial, which is also the number of bits in the generator's bit pattern minus one. CRC-16 and CRC-ITU both produce 16-bit CRCs but use different generators, so a receiver using the wrong one will reject every frame.",
            },
          ],
        },
      ],
    },
    {
      id: "s11",
      title: "Checksum: The Internet Checksum",
      body: [
        {
          type: "fig",
          fig: "m06-p16-checksum-diagram",
          caption: "Slide: Checksum Diagram — the message is divided into units, summed, and a checksum unit is appended.",
        },
        {
          type: "list",
          items: [
            "**Checksum** works on a message of **any length** — it is not tied to frames like CRC or parity.",
            "It is mostly used at the **network and transport layers** (the Internet checksum), not the data link layer.",
            "The sender sums m-bit units and sends the complement; the receiver re-sums and looks for all 1s.",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "the checksum algorithm",
          body: [
            {
              type: "p",
              text: "Checksum is an error-detecting technique applied to a message of any length. Unlike CRC or parity, which are tied to the data-link layer and operate on frames, checksum is mostly used at the network and transport layer rather than the data-link layer — it is the technique behind the IP header checksum and the TCP and UDP checksums. The procedure has four steps. At the source, the message is first divided into m-bit units. The generator then creates the checksum, which is an extra m-bit unit. At the destination, the checker creates a new checksum from the combination of the message and the sent checksum. If the checksum is all 0s (zeroes), the message is accepted; otherwise the message is discarded.",
            },
            {
              type: "list",
              items: [
                "Step 1 — at the source, the message is divided into m-bit units.",
                "Step 2 — the generator creates the checksum: an extra m-bit unit.",
                "Step 3 — at the destination, the checker creates a new checksum from the message plus the sent checksum.",
                "Step 4 — if the checksum is all 0s the message is accepted; otherwise it is discarded.",
              ],
            },
            {
              type: "p",
              text: "The arithmetic the checksum uses is one's complement addition, which differs from ordinary addition in one respect: whenever a sum produces a carry out of the top bit, that carry is wrapped around and added back into the least significant position. This end-around carry ensures the sum stays within m bits and makes the arithmetic independent of byte order in a useful way. The checksum itself is the one's complement of the final sum — you invert every bit. The elegance of the scheme is that the receiver does not need to know which unit is the checksum: it simply adds all the units including the checksum. The checksum was chosen so that the total is all 1s, so the one's complement of the total is all 0s — and that all-zeros result is the accept condition from step 4.",
            },
            {
              type: "formula",
              tex: "\\text{checksum} = \\overline{\\left( u_1 \\boxplus u_2 \\boxplus \\cdots \\boxplus u_n \\right)} \\qquad \\text{receiver: } u_1 \\boxplus \\cdots \\boxplus u_n \\boxplus \\text{checksum} = \\text{all 1s}",
              text: "The checksum is the one's complement (bit-wise inversion, written here with an overbar) of the one's-complement sum of all the m-bit message units, where the boxed-plus denotes wrap-around addition. At the receiver, adding every unit including the checksum yields all 1s, so the inverted result is all 0s, which is the accept condition.",
            },
            {
              type: "p",
              text: "The slide's own exercise is to use the word NSCOM3 to get the checksum, with an ASCII table supplying the value of each byte. Using 8-bit units, N = 0x4E = 78, S = 0x53 = 83, C = 0x43 = 67, O = 0x4F = 79, M = 0x4D = 77 and 3 = 0x33 = 51. The six bytes are added with wrap-around at 8 bits, and the checksum is the one's complement of the result. The arithmetic below was verified independently.",
            },
            {
              type: "example",
              text: "Compute the 8-bit checksum of the word NSCOM3 using ASCII byte values and one's complement arithmetic.",
              steps: [
                "ASCII values: N = 0x4E (78), S = 0x53 (83), C = 0x43 (67), O = 0x4F (79), M = 0x4D (77), 3 = 0x33 (51).",
                "Add N + S = 78 + 83 = 161 = 0xA1. No carry out of 8 bits.",
                "Add C: 0xA1 + 67 = 161 + 67 = 228 = 0xE4.",
                "Add O: 0xE4 + 79 = 228 + 79 = 307 = 0x133. A carry out of bit 8 appeared, so wrap it: drop the 0x100 and add 1 → 0x33 + 1 = 0x34.",
                "Add M: 0x34 + 77 = 52 + 77 = 129 = 0x81.",
                "Add 3: 0x81 + 51 = 129 + 51 = 180 = 0xB4. No further carry.",
                "The one's-complement sum is 0xB4, so the checksum is the inversion of 0xB4 = 0x4B = 01001011.",
                "Transmit NSCOM3 followed by the checksum byte 0x4B.",
                "Receiver check: sum all seven bytes with wrap-around — 0x4E + 0x53 + 0x43 + 0x4F + 0x4D + 0x33 + 0x4B = 0xB4 + 0x4B = 0xFF.",
                "0xFF is all 1s, so its one's complement is 00000000 — all zeros, so the message is accepted.",
              ],
            },
            {
              type: "example",
              text: "The Internet checksum uses 16-bit words rather than 8-bit units. Apply it to NSCOM3, padding the odd-length message with a zero byte.",
              steps: [
                "Six bytes form three 16-bit words: 0x4E53, 0x434F and 0x4D33. If fewer than four words, pad with a zero byte so the last word is complete.",
                "Add 0x4E53 + 0x434F = 0x91A2. No carry out of 16 bits.",
                "Add 0x4D33: 0x91A2 + 0x4D33 = 0xDED5. Still no carry.",
                "One's-complement sum = 0xDED5.",
                "Checksum = complement of 0xDED5 = 0x212A = 0010000100101010.",
                "Receiver adds all words plus the checksum: 0xDED5 + 0x212A = 0xFFFF, which is all 1s.",
                "Complementing gives 0x0000 — all zeros — so the message is accepted. The odd final byte, if present, is padded with zeros before being summed.",
              ],
            },
            {
              type: "table",
              head: ["Property", "Simple parity", "Checksum", "CRC"],
              rows: [
                ["Unit operated on", "1 bit per data unit", "m-bit units of any message length", "Whole codeword as a polynomial"],
                ["Layer of use", "Data link", "Network and transport (IP, TCP, UDP)", "Data link"],
                ["Catches even numbers of bit errors", "No", "Usually yes, in practice", "Yes, up to its burst guarantees"],
                ["Catches reordered or duplicated units", "No", "Weak for some reorderings", "Sensitive to positional order"],
                ["Redundancy cost", "1 bit per unit", "One m-bit unit per message", "r bits per codeword, r = deg G(x)"],
              ],
            },
            {
              type: "note",
              text: "The checksum's weaknesses are positional. It is an addition, so two errors that cancel numerically — a byte that gained value in one place and lost the same value elsewhere — can pass. It also catches changes in unit content better than changes in unit order. This is why Ethernet and most data-link technologies use CRC, while the network and transport layers, which need a length-independent check that software can compute cheaply in a few instructions, use checksum.",
            },
          ],
        },
      ],
    },
    {
      id: "s12",
      title: "Comparing and Choosing a Scheme",
      body: [
        {
          type: "list",
          items: [
            "Every scheme spends **redundancy** to make corruption visible; they differ in strength, cost and layer.",
            "**Parity** is cheapest and weakest. **CRC** is the data-link standard — strong and cheap in hardware.",
            "**Detection + retransmission** beats correction for data links: the odds of a second failure are negligible.",
          ],
        },
        {
          type: "deep",
          label: "Go deeper",
          hint: "which to use where",
          body: [
            {
              type: "p",
              text: "Every scheme in this module spends redundancy to make corruption visible, but they differ in strength, cost and where they sit in the protocol stack. Simple parity is one bit per unit and catches only odd numbers of flipped bits; two-dimensional parity adds a parity row and column, costs more, and uniquely corrects a single-bit error; checksum works on messages of arbitrary length with one m-bit unit of overhead and is used at the network and transport layers; CRC costs r bits per codeword but gives the strongest guarantees of the four, catching all single-bit errors, all bursts up to its degree, all odd-count errors when x + 1 divides the generator, and longer bursts with probability about 2^−r. Choosing between them is a question of what the medium does and what the layer needs.",
            },
            {
              type: "table",
              head: ["Scheme", "Redundancy", "Detects", "Corrects", "Where used"],
              rows: [
                ["Simple parity", "1 bit per data unit", "Odd number of bit errors only", "Nothing", "Very simple legacy links, memory"],
                ["Two-dimensional parity", "1 bit per row plus 1 per column", "Many multi-bit errors", "One single-bit error", "Block-oriented storage and legacy links"],
                ["Checksum", "One m-bit unit per message", "Most errors, any message length", "Nothing", "IP header, TCP and UDP"],
                ["CRC", "r bits per codeword, r = deg G(x)", "All bursts ≤ r; odd-count errors", "Nothing (used with retransmission)", "Ethernet, framed serial links, storage"],
              ],
            },
            {
              type: "p",
              text: "CRC detects but never corrects, which sounds like a weakness until you consider the alternative. Correcting an error requires enough redundancy to identify which bit changed, which for a k-bit block means roughly log2(k) extra bits — far more than the r bits CRC spends. On a data link with a return path, it is cheaper to spend a small number of check bits, detect the error, discard the frame, and let the transport retransmit it. That arrangement is called automatic repeat request, or ARQ, and it is why Ethernet frames carry a CRC-32 and no correction bits at all. Correction is reserved for situations where there is no practical return path — deep-space links, some broadcast media, and real-time streams where a retransmission would arrive too late to be useful.",
            },
            {
              type: "example",
              text: "A 1,500-byte Ethernet frame carries a CRC-32. Express the redundancy both in bits and as a percentage of the frame, and compare it with a hypothetical correction scheme that needed 11 extra bits to name the position of a single corrupted bit in a 12,000-bit frame.",
              steps: [
                "The CRC-32 field is 32 bits = 4 bytes.",
                "Frame payload is 1,500 bytes = 12,000 bits, so the codeword is 12,032 bits.",
                "CRC redundancy = 32 / 12,032 ≈ 0.27% of the transmitted bits.",
                "To correct a single-bit error by naming its position in a 12,000-bit frame you need enough bits to index 12,000 positions, which is log2(12,000) ≈ 13.6, so 14 bits — about half the CRC's cost.",
                "On this comparison the cost is similar, but CRC-32 also catches every burst up to 32 bits and misses only about 1 in 4.3 billion longer bursts, whereas a position-indexing correction scheme gives no burst guarantee at all.",
              ],
            },
            {
              type: "note",
              text: "Do not memorise the four schemes as rivals. They are a cost ladder: parity for the cheapest possible check on a short unit, two-dimensional parity when you need to correct an isolated bit without a return path, checksum when the message length is not known in advance and the layer is above the data link, and CRC when the medium is bursty and the check must be strong.",
            },
          ],
        },
      ],
    },
  ],
  flashcards: [
    { q: "What is the difference between a single-bit error and a burst error?",
      a: "A single-bit error changes exactly 1 bit of the data unit from 1 to 0 or 0 to 1. A burst error changes 2 or more bits in the data unit.", sec: "s2" },
    { q: "How is the length of a burst error measured?",
      a: "From the first corrupted bit to the last corrupted bit, inclusive. The bits inside that span that were not affected are still counted as part of the burst, so a burst of length 8 may contain as few as 2 flipped bits.", sec: "s2" },
    { q: "Why are burst errors more common than single-bit errors on real links?",
      a: "Interference lasts for a finite interval, and every bit on the wire during that interval can be affected. Such interference is called noise on the channel and destroys all data during that interval, so errors arrive in clusters rather than singly.", sec: "s2" },
    { q: "What is the central concept behind detecting or correcting errors, and who adds the extra bits?",
      a: "Redundancy. The redundant bits are added by the sender and removed by the receiver.", sec: "s3" },
    { q: "What information does error correction need that error detection does not?",
      a: "Error detection only asks whether any error occurred. Error correction needs the exact number of bits corrupted and, more importantly, their location in the message.", sec: "s3" },
    { q: "Define the Hamming distance between two words.",
      a: "The number of bit positions at which the two words differ — equivalently, the number of 1s in their XOR.", sec: "s4" },
    { q: "What minimum Hamming distance is needed to detect d errors, and to correct d errors?",
      a: "To detect up to d errors, d_min ≥ d + 1. To correct up to d errors, d_min ≥ 2d + 1. A code corrects up to floor(d_min / 2) errors.", sec: "s4" },
    { q: "State the definition of a simple parity-check code.",
      a: "A single-bit error-detecting code in which n = k + 1 with d_min = 2 — one redundant bit is appended, and the sender and receiver must agree on even or odd parity.", sec: "s5" },
    { q: "Which errors does simple parity fail to detect, and why?",
      a: "Errors in an even number of bits. Flipping two bits changes the count of 1s by an even amount, so the agreed parity still holds and the corrupted word is accepted silently. Parity also cannot correct anything.", sec: "s5" },
    { q: "How does a two-dimensional parity check correct a single-bit error?",
      a: "The data are laid out as a grid with row parities and column parities. A single flipped bit breaks exactly one row parity and one column parity; their intersection identifies the corrupted bit, which the receiver flips back.", sec: "s6" },
    { q: "How does CRC treat the packet of data?",
      a: "As a large polynomial. The transmitter divides the message polynomial by a given generating polynomial using polynomial arithmetic; the quotient is discarded and the remainder is attached to the end of the message.", sec: "s7" },
    { q: "Given a generator polynomial, how many zeros does the sender append, and how long is the CRC field?",
      a: "Append as many zeros as the degree of the generator polynomial. The CRC field has exactly that many bits, because the remainder of the division has degree less than that of the generator.", sec: "s7" },
    { q: "What is the receiver's CRC procedure, and what do zero and non-zero remainders mean?",
      a: "The receiver divides the message and remainder — the whole codeword — by the same generating polynomial. A remainder of zero means no error was detected (accept); a remainder not equal to zero means an error occurred during transmission (reject).", sec: "s8" },
    { q: "Why must leading zeros never be stripped from a CRC remainder?",
      a: "The CRC field is exactly deg(G) bits wide, and each zero is a real bit position. Dropping a zero changes which bit position is the leading one during division and makes the answer wrong. A remainder of 011 must not be written as 11.", sec: "s8" },
    { q: "Data 1101011011 with generator 10011. What is the CRC remainder and the transmitted codeword?",
      a: "Append four zeros (degree 4) to get 11010110110000, divide by 10011. The remainder is 1110, so the codeword is 11010110111110. Dividing that codeword by 10011 at the receiver gives remainder 0000.", sec: "s9" },
    { q: "Gate's slide example: P(x) = x5 + x4 + x2 + 1 and M(x) = 1010011010. What are the remainder and the codeword?",
      a: "P(x) = 110101, degree 5. Append five zeros to the message: 101001101000000. Dividing by 110101 leaves remainder 10110, so the codeword is 101001101010110. Dividing the codeword by 110101 gives remainder 00000.", sec: "s9" },
    { q: "List the CRC polynomials named on the slide.",
      a: "CRC-12: x12 + x11 + x3 + x2 + x + 1. CRC-16: x16 + x15 + x2 + 1. CRC-CCITT (CRC-ITU): x16 + x15 + x5 + 1. CRC-32: x32 + x26 + x23 + x22 + x16 + x12 + x11 + x10 + x8 + x7 + x5 + x4 + x2 + x + 1. ATM CRC: x8 + x2 + x + 1.", sec: "s10" },
    { q: "What does the degree of a CRC generator polynomial tell you about the CRC field?",
      a: "The degree r equals the number of CRC bits produced, equals the number of zeros appended before division, and equals the length of the generator's bit pattern minus one. A degree-16 generator such as CRC-16 or CRC-ITU yields a 16-bit CRC.", sec: "s10" },
    { q: "State the four steps of the checksum procedure.",
      a: "At the source the message is divided into m-bit units; the generator creates the checksum, an extra m-bit unit; at the destination the checker creates a new checksum from the message plus the sent checksum; if it is all 0s the message is accepted, otherwise it is discarded.", sec: "s11" },
    { q: "At which layers is checksum mostly used, and why does that differ from CRC?",
      a: "Checksum is mostly used at the network and transport layers rather than the data-link layer — it applies to a message of any length. CRC is a data-link technique that operates on a whole codeword.", sec: "s11" },
    { q: "Compute the 8-bit checksum of the ASCII bytes of NSCOM3.",
      a: "N = 0x4E, S = 0x53, C = 0x43, O = 0x4F, M = 0x4D, 3 = 0x33. One's-complement sum = 0xB4, so the checksum is the inversion of 0xB4 = 0x4B. The receiver sums all seven bytes and gets 0xFF, whose complement is 00000000 — accept.", sec: "s11" },
    { q: "Why is CRC preferred over checksum on Ethernet links?",
      a: "CRC gives stronger, provable guarantees on bursty media: a degree-r generator catches all single-bit errors, all burst errors of length r or less, and all odd-count errors when x + 1 divides the generator, and misses longer bursts with probability about 2^−r. Ethernet therefore uses CRC-32.", sec: "s12" },
    { q: "Why do data links use CRC with retransmission instead of correction?",
      a: "Correction needs far more redundancy than detection and only pays off when there is no useful return path. On a link with a return path it is cheaper to detect with a small CRC, discard the frame, and let the transport retransmit it (ARQ). Correction is reserved for deep space, broadcast and real-time streams.", sec: "s12" },
  ],
  quiz: [
    { q: "A data unit has exactly one bit inverted in transit. What is this called?",
      choices: ["A single-bit error", "A burst error of length 1", "A parity failure", "A checksum collision"],
      answer: 0,
      why: "A single-bit error means only 1 bit of the data unit is changed from 1 to 0 or from 0 to 1. A burst error by definition involves 2 or more changed bits.", sec: "s2" },
    { q: "A byte is sent as 00000000 and received as 00111000. How is this error described?",
      choices: ["A single-bit error", "A burst error of length 3", "A burst error of length 1", "No detectable change in parity"],
      answer: 1,
      why: "Three bits changed, which is 2 or more, so it is a burst error. The burst length is measured from the first corrupted bit to the last, giving a length of 3.", sec: "s2" },
    { q: "Why are burst errors the dominant error type on real transmission links?",
      choices: ["Because receivers sample bits too slowly", "Because interference lasts for a finite interval, so every bit on the wire during that interval can be affected", "Because CRC generators deliberately group errors", "Because parity can only ever create bursts"],
      answer: 1,
      why: "Interference is unpredictable but finite in duration. Every bit transmitted during that interval is subject to the same disturbance, so corrupted bits arrive in clusters rather than singly.", sec: "s2" },
    { q: "What is the central concept behind detecting or correcting errors?",
      choices: ["Compression", "Encryption", "Redundancy", "Modulation"],
      answer: 2,
      why: "Redundancy is the central concept. Redundant bits are added by the sender and removed by the receiver to let the receiver check the message.", sec: "s3" },
    { q: "What does error correction require that error detection does not?",
      choices: ["A retransmission request", "The exact number of corrupted bits and their location in the message", "A shared secret key", "A higher bit rate"],
      answer: 1,
      why: "In error detection we only look to see if any error has occurred. In error correction we need to know the exact number of bits corrupted and, more importantly, their location in the message.", sec: "s3" },
    { q: "What is the Hamming distance between 10101 and 11010?",
      choices: ["2", "3", "4", "5"],
      answer: 2,
      why: "XOR the words: 10101 ⊕ 11010 = 01111, which has four 1s, so the Hamming distance is 4 — they differ in four bit positions.", sec: "s4" },
    { q: "A code must be able to correct up to 2 errors. What minimum Hamming distance is required?",
      choices: ["2", "3", "5", "6"],
      answer: 2,
      why: "Correcting up to d errors requires d_min ≥ 2d + 1. With d = 2 that is d_min ≥ 2(2) + 1 = 5. Detecting 2 errors would only need d_min ≥ 3.", sec: "s4" },
    { q: "A simple parity-check code has which parameters?",
      choices: ["n = k, d_min = 1", "n = k + 1, d_min = 2", "n = 2k, d_min = 3", "n = k + log2 k, d_min = 2"],
      answer: 1,
      why: "A simple parity-check code is a single-bit error-detecting code in which n = k + 1 with d_min = 2 — exactly one redundant bit is appended.", sec: "s5" },
    { q: "Under even parity, what is the codeword for the dataword 1100111?",
      choices: ["11001110", "11001111", "11001100", "11001101"],
      answer: 1,
      why: "1100111 contains five 1s, which is odd, so the even-parity bit must be 1 to make the total six (even). The codeword is therefore 11001111.", sec: "s5" },
    { q: "Which error pattern will a simple parity check fail to detect?",
      choices: ["One bit flipped", "Three bits flipped", "Two bits flipped", "Five bits flipped"],
      answer: 2,
      why: "Parity detects only odd numbers of flipped bits. Flipping two bits changes the count of 1s by an even amount, so the parity still holds and the corrupted word is accepted silently.", sec: "s5" },
    { q: "What unique capability does a two-dimensional parity check have among the schemes in this module?",
      choices: ["It detects all possible burst errors", "It can correct the single error bit using row and column parity", "It needs no redundant bits", "It works without the sender and receiver agreeing on anything"],
      answer: 1,
      why: "Two-dimensional parity allows detection of error bits and correction of the error bit, using row parity and column parity: a single flipped bit breaks exactly one row and one column check, and their intersection locates it.", sec: "s6" },
    { q: "In a two-dimensional parity grid, two bits in the same row are flipped. What is the outcome?",
      choices: ["The error is corrected automatically", "The row parity fails and the column parities are fine", "The row parity still holds but two column parities fail, so the error is detected but not correctable", "Nothing is detected at all"],
      answer: 2,
      why: "Two flips in one row change that row's count of 1s by an even amount, so the row parity still holds. The two affected columns both fail, so the error is detected, but the single-intersection correction rule does not apply and the block must be retransmitted.", sec: "s6" },
    { q: "How does CRC treat the packet of data being transmitted?",
      choices: ["As a sequence of independent bytes to be summed", "As a large polynomial that is divided by a generating polynomial", "As a two-dimensional grid of rows and columns", "As a single redundant bit appended to each unit"],
      answer: 1,
      why: "The CRC method treats the packet of data as a large polynomial. The transmitter divides the message polynomial by a given generating polynomial; the quotient is discarded and the remainder is attached to the end of the message.", sec: "s7" },
    { q: "A generator polynomial for CRC has degree 4. How many bits does the appended CRC field contain?",
      choices: ["3 bits", "4 bits", "5 bits", "8 bits"],
      answer: 1,
      why: "The degree of the generator equals the number of appended zeros before division and also equals the number of CRC bits in the codeword. A degree-4 generator produces a 4-bit remainder.", sec: "s7" },
    { q: "Data 1101011011 is protected with generator 10011. What is the transmitted codeword, and what does the receiver's division yield?",
      choices: ["11010110110000, receiver remainder 0000", "11010110111110, receiver remainder 0000", "11010110111110, receiver remainder 1110", "11010110110111, receiver remainder 1110"],
      answer: 1,
      why: "Four zeros are appended (degree 4), giving 11010110110000. Dividing by 10011 leaves remainder 1110, so the codeword is data plus CRC = 11010110111110. Dividing that whole codeword by 10011 gives remainder 0000, so it is accepted.", sec: "s9" },
    { q: "Which statement about the receiver's CRC procedure is correct?",
      choices: ["The receiver divides the whole codeword, message plus remainder, by the same generating polynomial", "The receiver strips the CRC off and divides only the data bits", "The receiver divides by a different polynomial chosen to match the remainder", "The receiver compares the CRC against a stored copy of the original message"],
      answer: 0,
      why: "The receiver divides the message and remainder by the same generating polynomial. A remainder not equal to zero means there was an error during transmission; a remainder of zero means there was no error detected.", sec: "s8" },
    { q: "A CRC division leaves a remainder of three bits, but the generator has degree 5. What is the correct way to record the remainder?",
      choices: ["Write the three bits as they are, since leading zeros carry no value", "Pad it on the right with zeros to make five bits", "Pad it on the left with zeros to make five bits, since leading zeros are real bit positions", "Discard the remainder and send the quotient instead"],
      answer: 2,
      why: "The CRC field is exactly deg(G) bits wide, so leading zeros are significant bit positions. A remainder of 011 is not 11; stripping a zero changes which bit position is the leading one in subsequent division steps and produces a wrong answer.", sec: "s8" },
    { q: "P(x) = x5 + x4 + x2 + 1 and M(x) = 1010011010. What is the remainder from long-hand division?",
      choices: ["10110", "00000", "110101", "101001"],
      answer: 0,
      why: "P(x) as bits is 110101, a degree-5 generator, so five zeros are appended to the message to give 101001101000000. Dividing by 110101 leaves the 5-bit remainder 10110; the codeword 101001101010110 then divides by 110101 with remainder 00000.", sec: "s9" },
    { q: "Which polynomial is CRC-CCITT, also called CRC-ITU?",
      choices: ["x16 + x15 + x2 + 1", "x16 + x15 + x5 + 1", "x12 + x11 + x3 + x2 + x + 1", "x32 + x26 + x23 + x22 + x16 + x12 + x11 + x10 + x8 + x7 + x5 + x4 + x2 + x + 1"],
      answer: 1,
      why: "CRC-CCITT (CRC-ITU) is x16 + x15 + x5 + 1 — the ITU-T polynomial for 8-bit characters. The x16 + x15 + x2 + 1 form is CRC-16, the x12 form is CRC-12, and the degree-32 form is CRC-32.", sec: "s10" },
    { q: "A CRC generator polynomial is degree 16. What is the length of its bit pattern?",
      choices: ["15 bits", "16 bits", "17 bits", "33 bits"],
      answer: 2,
      why: "The bit pattern's length is the degree plus one, because the pattern includes the constant term as well as every power of x up to the degree. So a degree-16 generator such as CRC-16 is written as a 17-bit pattern.", sec: "s10" },
    { q: "At which layers is the checksum technique mostly used?",
      choices: ["Physical and data link", "Network and transport", "Session and presentation", "Application and physical"],
      answer: 1,
      why: "Checksum is an error-detecting technique applied to a message of any length and is mostly used at the network and transport layers rather than the data-link layer — the IP header checksum and TCP/UDP checksums are the standard examples.", sec: "s11" },
    { q: "Using 8-bit units, what is the checksum of the ASCII bytes of NSCOM3 (0x4E, 0x53, 0x43, 0x4F, 0x4D, 0x33)?",
      choices: ["0xB4", "0x4B", "0xFF", "0xE4"],
      answer: 1,
      why: "The one's-complement sum of the six bytes is 0xB4 (the intermediate sum 0x133 wraps its carry around), so the checksum is the inversion of 0xB4 = 0x4B. The receiver adds all seven bytes to get 0xFF, whose complement is 00000000, so the message is accepted.", sec: "s11" },
    { q: "Why do Ethernet and most data-link technologies use CRC rather than checksum?",
      choices: ["Because CRC is easier for software to compute in a few instructions", "Because CRC applies to any message length whereas checksum does not", "Because checksum requires a shared secret key", "Because CRC gives strong burst guarantees — a degree-r generator catches all bursts of length r or less — which suits bursty media"],
      answer: 3,
      why: "A degree-r generator catches all single-bit errors, all burst errors of length r or less, and all odd-count errors when x + 1 divides the generator, missing longer bursts only with probability about 2^−r. That strength matters on bursty media, where the checksum's positional weaknesses are a liability.", sec: "s12" },
    { q: "A frame carries 1,500 payload bytes protected by a CRC-32. What is the redundancy overhead of the CRC as a fraction of the transmitted bits?",
      choices: ["About 0.27%", "About 2.7%", "About 27%", "About 0.027%"],
      answer: 0,
      why: "The CRC-32 field is 32 bits while 1,500 bytes is 12,000 bits, so the codeword is 12,032 bits and the overhead is 32 / 12,032 ≈ 0.27% — a very small price for the guarantee that catches every burst up to 32 bits.", sec: "s12" },
  ],
});
