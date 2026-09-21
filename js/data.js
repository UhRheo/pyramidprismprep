// Static content: AP exam unit videos + explanations + quizzes, and SAT question bank.
// Quiz format: { q, choices: [4 strings], answer: index, explain }

const SUBJECTS = {
  biology: {
    name: "AP Biology",
    color: "#2f9e6e",
    units: [
      {
        id: 1,
        title: "Unit 1: Chemistry of Life",
        videoId: "X1idfNwjJYU",
        explanation: "This unit covers the chemistry that underlies biology: water's polarity and hydrogen bonding (which give it cohesion, adhesion, high specific heat, and its role as a solvent), the structure and function of the four major macromolecules (carbohydrates, lipids, proteins, nucleic acids), how monomers join via dehydration synthesis and split via hydrolysis, and how enzymes speed up reactions by lowering activation energy. Pay close attention to how a protein's shape determines its function and how factors like pH and temperature can denature enzymes.",
        quiz: [
          { q: "Which property of water allows organisms to resist rapid temperature changes?", choices: ["High specific heat", "Low density as a solid", "Cohesion", "Adhesion"], answer: 0, explain: "Water's high specific heat means it absorbs/releases a lot of heat with only a small temperature change, helping organisms maintain homeostasis." },
          { q: "Which macromolecule is the primary long-term energy storage molecule in animals?", choices: ["Carbohydrates", "Lipids", "Proteins", "Nucleic acids"], answer: 1, explain: "Lipids (fats) store roughly twice the energy per gram of carbohydrates, making them efficient for long-term storage." },
          { q: "What type of reaction joins two monomers together and releases a water molecule?", choices: ["Hydrolysis", "Dehydration synthesis", "Oxidation", "Phosphorylation"], answer: 1, explain: "Dehydration synthesis (condensation) forms a covalent bond between monomers and releases H2O." },
          { q: "How do enzymes increase the rate of a chemical reaction?", choices: ["By increasing the free energy of products", "By raising the activation energy needed", "By lowering the activation energy needed", "By being consumed in the reaction"], answer: 2, explain: "Enzymes are catalysts that lower the activation energy barrier, letting reactions proceed faster without being used up." },
          { q: "A solution with a pH of 3 is how many times more acidic than a solution with a pH of 6?", choices: ["3 times", "30 times", "300 times", "1,000 times"], answer: 3, explain: "pH is logarithmic (base 10), so a difference of 3 pH units equals a 10^3 = 1,000-fold difference in H+ concentration." }
        ]
      },
      {
        id: 2,
        title: "Unit 2: Cell Structure and Function",
        videoId: "h0JkytGr07o",
        explanation: "This unit explores the internal structure of cells and how that structure supports function. Key ideas include the fluid mosaic model of the plasma membrane, selective permeability, passive transport (diffusion, osmosis, facilitated diffusion) versus active transport (which requires ATP), the roles of organelles like the mitochondria, ribosomes, and endomembrane system, and the endosymbiotic theory explaining the origin of mitochondria and chloroplasts. The relationship between surface-area-to-volume ratio and cell size is a recurring theme.",
        quiz: [
          { q: "What does the endosymbiotic theory propose about mitochondria?", choices: ["They evolved from folded plasma membrane", "They originated from engulfed prokaryotes living symbiotically inside a host cell", "They are remnants of the nuclear envelope", "They formed spontaneously from lipids"], answer: 1, explain: "Evidence like mitochondrial DNA, double membranes, and ribosome size supports mitochondria (and chloroplasts) originating as free-living prokaryotes engulfed by an ancestral host cell." },
          { q: "Why does a smaller cell size generally benefit a cell's ability to exchange materials?", choices: ["Smaller cells have a lower surface-area-to-volume ratio", "Smaller cells have a higher surface-area-to-volume ratio", "Cell size does not affect exchange rate", "Smaller cells have more organelles"], answer: 1, explain: "As cells get smaller, the surface-area-to-volume ratio increases, allowing more efficient exchange of nutrients and waste relative to the cell's volume." },
          { q: "Which type of transport requires the cell to expend ATP?", choices: ["Simple diffusion", "Osmosis", "Facilitated diffusion", "Active transport"], answer: 3, explain: "Active transport moves substances against their concentration gradient, which requires energy input, usually from ATP." },
          { q: "What is the main function of ribosomes?", choices: ["Lipid synthesis", "Protein synthesis", "ATP production", "DNA replication"], answer: 1, explain: "Ribosomes translate mRNA into polypeptide chains, synthesizing proteins." },
          { q: "In the fluid mosaic model, what makes the membrane 'fluid'?", choices: ["Fixed protein channels", "Phospholipids and proteins can move laterally within the membrane", "The membrane is made of solid cholesterol", "Water constantly flows through it"], answer: 1, explain: "Phospholipids and many membrane proteins are not fixed in place; they drift laterally, giving the membrane a fluid, dynamic quality." }
        ]
      },
      {
        id: 3,
        title: "Unit 3: Cellular Energetics",
        videoId: "AOtJk7pq0bs",
        explanation: "This unit covers how cells capture and use energy through photosynthesis and cellular respiration. In photosynthesis, light reactions in the thylakoid membrane produce ATP and NADPH, which power the Calvin cycle in the stroma to fix carbon into sugar. In cellular respiration, glycolysis (cytoplasm), the Krebs cycle (mitochondrial matrix), and oxidative phosphorylation (inner mitochondrial membrane, using chemiosmosis and ATP synthase) break down glucose to produce ATP, with oxygen as the final electron acceptor. Fermentation is also covered as an anaerobic alternative that regenerates NAD+.",
        quiz: [
          { q: "Where do the light-dependent reactions of photosynthesis take place?", choices: ["Stroma", "Thylakoid membrane", "Mitochondrial matrix", "Cytoplasm"], answer: 1, explain: "The light reactions occur in the thylakoid membrane, where photosystems capture light energy to produce ATP and NADPH." },
          { q: "Which process occurs in the cytoplasm and does not require oxygen?", choices: ["Krebs cycle", "Electron transport chain", "Glycolysis", "Calvin cycle"], answer: 2, explain: "Glycolysis breaks glucose into pyruvate in the cytoplasm and does not require oxygen." },
          { q: "What is the role of ATP synthase during chemiosmosis?", choices: ["It pumps H+ ions against their gradient using ATP", "It uses the flow of H+ ions down their gradient to synthesize ATP", "It breaks down glucose directly", "It transports electrons between complexes"], answer: 1, explain: "ATP synthase allows H+ ions to flow down their concentration gradient through it, and that flow powers the phosphorylation of ADP into ATP." },
          { q: "What serves as the final electron acceptor in aerobic cellular respiration?", choices: ["NAD+", "Pyruvate", "Oxygen", "Glucose"], answer: 2, explain: "Oxygen accepts electrons at the end of the electron transport chain, combining with H+ to form water." },
          { q: "Why does fermentation occur when oxygen is unavailable?", choices: ["To produce more ATP than aerobic respiration", "To regenerate NAD+ so glycolysis can continue", "To directly produce large amounts of CO2", "To replace the need for glucose"], answer: 1, explain: "Fermentation regenerates NAD+ from NADH so glycolysis can keep running and produce a small amount of ATP without oxygen." }
        ]
      },
      {
        id: 4,
        title: "Unit 4: Cell Communication and Cell Cycle",
        videoId: "_Ad5WG_R0j8",
        explanation: "This unit examines how cells communicate through signal transduction pathways (reception, transduction, and response), including the role of second messengers like cAMP and the amplification of signals through phosphorylation cascades. It also covers the cell cycle, including interphase (G1, S, G2), mitosis, and cytokinesis, along with the checkpoints that regulate progression through the cycle. Apoptosis (programmed cell death) and the consequences of uncontrolled cell division (cancer) are also key topics.",
        quiz: [
          { q: "What are the three stages of cell signaling in order?", choices: ["Transduction, reception, response", "Reception, transduction, response", "Response, reception, transduction", "Reception, response, transduction"], answer: 1, explain: "A signal is first received by a receptor, then transduced through a pathway inside the cell, and finally triggers a cellular response." },
          { q: "Which cell cycle checkpoint verifies that DNA has been accurately replicated before mitosis?", choices: ["G1 checkpoint", "G2 checkpoint", "M checkpoint (spindle checkpoint)", "S checkpoint"], answer: 1, explain: "The G2 checkpoint checks for complete and accurate DNA replication before the cell commits to mitosis." },
          { q: "What is apoptosis?", choices: ["Uncontrolled cell division", "A form of programmed cell death", "The process of DNA replication", "A type of cell signaling receptor"], answer: 1, explain: "Apoptosis is a regulated process of programmed cell death that removes damaged or unneeded cells." },
          { q: "What is a common role of second messengers like cAMP in signal transduction?", choices: ["They directly bind to DNA to turn on genes", "They relay and amplify signals inside the cell after receptor activation", "They are the original signaling molecule from outside the cell", "They break down the plasma membrane"], answer: 1, explain: "Second messengers like cAMP spread and amplify a signal inside the cell once a receptor has been activated by the original signaling molecule." },
          { q: "Uncontrolled cell division that ignores normal checkpoint regulation is most closely associated with what?", choices: ["Apoptosis", "Cancer", "Meiosis", "Osmosis"], answer: 1, explain: "Cancer arises when cells bypass normal cell cycle checkpoints and divide uncontrollably." }
        ]
      },
      {
        id: 5,
        title: "Unit 5: Heredity",
        videoId: "JwQpAU9SQRM",
        explanation: "This unit covers Mendelian genetics, including the Law of Segregation (allele pairs separate during gamete formation) and the Law of Independent Assortment (genes for different traits sort independently), as well as non-Mendelian patterns like incomplete dominance, codominance, and linked genes. It also addresses meiosis as the source of genetic variation, chromosomal inheritance patterns, nondisjunction and resulting aneuploidies, and sex-linked inheritance.",
        quiz: [
          { q: "Mendel's Law of Segregation states that:", choices: ["Genes for different traits assort independently", "The two alleles for a gene separate during gamete formation", "Alleles blend together in the offspring", "All traits are inherited together on the same chromosome"], answer: 1, explain: "The Law of Segregation states that each organism carries two alleles for a gene, and these separate so each gamete gets only one allele." },
          { q: "In codominance, what happens to the two alleles in a heterozygote?", choices: ["One allele completely masks the other", "The alleles blend to create an intermediate phenotype", "Both alleles are fully and separately expressed", "Neither allele is expressed"], answer: 2, explain: "In codominance, both alleles are expressed distinctly and simultaneously, such as in AB blood type." },
          { q: "What term describes genes located close together on the same chromosome that tend to be inherited together?", choices: ["Independent assortment", "Linked genes", "Codominant genes", "Polygenic traits"], answer: 1, explain: "Linked genes are located near each other on the same chromosome and are usually inherited together, violating independent assortment." },
          { q: "Nondisjunction during meiosis can result in what condition in offspring?", choices: ["Increased genetic diversity only", "Aneuploidy (an abnormal chromosome number)", "Guaranteed lethality", "Only sex-linked traits"], answer: 1, explain: "Nondisjunction, the failure of chromosomes to separate properly, can lead to gametes with an abnormal number of chromosomes, causing aneuploidy (e.g., trisomy 21)." },
          { q: "A recessive allele located on the X chromosome is more commonly expressed phenotypically in which sex, and why?", choices: ["Females, because they have two X chromosomes", "Males, because they only need one copy since they have a single X chromosome", "Both sexes equally", "Neither sex, since X-linked traits are always dominant"], answer: 1, explain: "Males are hemizygous for X-linked genes (XY), so a single recessive allele on their one X chromosome will be expressed." }
        ]
      },
      {
        id: 6,
        title: "Unit 6: Gene Expression and Regulation",
        videoId: "iNE_t7lodfs",
        explanation: "This unit follows the central dogma of molecular biology: DNA is transcribed into RNA, and RNA is translated into protein. It covers the details of transcription and translation, RNA processing in eukaryotes, and gene regulation mechanisms such as operons in prokaryotes (e.g., the lac operon) and transcription factors and epigenetic modifications in eukaryotes. Mutations, including point mutations and frameshift mutations, and their potential effects on protein function are also covered.",
        quiz: [
          { q: "What is the correct order of the central dogma of molecular biology?", choices: ["Protein → RNA → DNA", "DNA → RNA → Protein", "RNA → Protein → DNA", "DNA → Protein → RNA"], answer: 1, explain: "The central dogma describes the flow of genetic information: DNA is transcribed into RNA, and RNA is translated into protein." },
          { q: "In eukaryotic cells, where does transcription occur?", choices: ["Cytoplasm", "Mitochondria", "Nucleus", "Ribosomes"], answer: 2, explain: "In eukaryotes, transcription takes place in the nucleus, where DNA is used as a template to synthesize mRNA." },
          { q: "The lac operon is an example of gene regulation in which type of organism?", choices: ["Eukaryotes only", "Prokaryotes", "Viruses only", "Fungi only"], answer: 1, explain: "The lac operon is a classic example of gene regulation in prokaryotes like E. coli, controlling lactose metabolism genes." },
          { q: "A mutation that inserts a single nucleotide into a DNA sequence, shifting the reading frame, is called a:", choices: ["Point mutation", "Silent mutation", "Frameshift mutation", "Nonsense mutation"], answer: 2, explain: "Inserting or deleting nucleotides (not in multiples of three) shifts the reading frame downstream, which is called a frameshift mutation." },
          { q: "What is a general function of transcription factors in eukaryotic gene regulation?", choices: ["They translate mRNA into protein", "They bind to DNA regulatory regions to help control transcription of specific genes", "They degrade damaged proteins", "They replicate DNA during the S phase"], answer: 1, explain: "Transcription factors bind to promoter or enhancer regions of DNA and help activate or repress the transcription of specific genes." }
        ]
      },
      {
        id: 7,
        title: "Unit 7: Natural Selection",
        videoId: "eeMCQstdr70",
        explanation: "This unit explores the mechanisms and evidence for evolution by natural selection, including evidence from the fossil record, homologous and analogous structures, and molecular biology. It introduces the Hardy-Weinberg equilibrium as a null model for a non-evolving population, and covers patterns of selection (directional, stabilizing, disruptive), mechanisms of speciation (allopatric and sympatric, and pre/post-zygotic reproductive barriers), and non-selective evolutionary forces like genetic drift (founder effect and bottleneck effect) and gene flow.",
        quiz: [
          { q: "Which type of natural selection favors individuals at both extremes of a phenotype range over the intermediate phenotype?", choices: ["Directional selection", "Stabilizing selection", "Disruptive selection", "Sexual selection"], answer: 2, explain: "Disruptive selection favors both extreme phenotypes over the average, which can increase variation and potentially drive speciation." },
          { q: "What condition is NOT one of the assumptions required for a population to be in Hardy-Weinberg equilibrium?", choices: ["No mutation", "Random mating", "Natural selection is occurring", "No gene flow"], answer: 2, explain: "Hardy-Weinberg equilibrium assumes no natural selection is occurring, along with no mutation, random mating, no gene flow, and a very large population size (no genetic drift)." },
          { q: "The founder effect is an example of what evolutionary mechanism?", choices: ["Natural selection", "Genetic drift", "Gene flow", "Mutation"], answer: 1, explain: "The founder effect occurs when a small group starts a new population, and by chance carries only a subset of the original population's genetic variation — a form of genetic drift." },
          { q: "A structure that is similar in function but evolved independently in unrelated species (like the wings of insects and birds) is called:", choices: ["A homologous structure", "An analogous structure", "A vestigial structure", "A derived character"], answer: 1, explain: "Analogous structures arise from convergent evolution — similar function, but not from a shared recent ancestor." },
          { q: "Two species that cannot successfully mate because their mating rituals differ are separated by which type of reproductive barrier?", choices: ["Postzygotic barrier", "Geographic isolation", "Prezygotic barrier (behavioral isolation)", "Genetic drift"], answer: 2, explain: "Behavioral isolation, a prezygotic barrier, prevents mating from occurring in the first place due to differing courtship or mating behaviors." }
        ]
      },
      {
        id: 8,
        title: "Unit 8: Ecology",
        videoId: "jBrepVbmNG4",
        explanation: "This unit examines interactions between organisms and their environment at multiple scales. Topics include energy flow through trophic levels (and the 10% rule of energy transfer), population growth models (exponential vs. logistic growth and carrying capacity), species interactions (competition, predation, mutualism, commensalism, parasitism), community ecology concepts like keystone species and succession, and biogeochemical cycles such as the carbon and nitrogen cycles.",
        quiz: [
          { q: "According to the 10% rule, if primary producers have 10,000 kcal of energy, approximately how much energy is available to primary consumers?", choices: ["10,000 kcal", "1,000 kcal", "100 kcal", "10 kcal"], answer: 1, explain: "On average, only about 10% of energy is transferred from one trophic level to the next, so 10,000 kcal → about 1,000 kcal." },
          { q: "Which population growth model includes a carrying capacity that limits growth as resources become scarce?", choices: ["Exponential growth", "Logistic growth", "Linear growth", "Geometric growth"], answer: 1, explain: "Logistic growth models population growth that slows as it approaches the environment's carrying capacity (K), unlike unlimited exponential growth." },
          { q: "A species that has a disproportionately large effect on its community relative to its abundance is called a:", choices: ["Keystone species", "Invasive species", "Pioneer species", "Indicator species"], answer: 0, explain: "A keystone species has an outsized influence on community structure; removing it can cause dramatic changes to the ecosystem." },
          { q: "Which species interaction benefits one organism while harming the other?", choices: ["Mutualism", "Commensalism", "Predation/parasitism", "Neutralism"], answer: 2, explain: "In predation and parasitism, one organism (predator/parasite) benefits at the expense of the other (prey/host)." },
          { q: "Which process returns carbon from the atmosphere into living organisms?", choices: ["Cellular respiration", "Photosynthesis", "Combustion", "Decomposition"], answer: 1, explain: "Photosynthesis removes CO2 from the atmosphere and fixes it into organic molecules, moving carbon into living organisms." }
        ]
      }
    ]
  },
  world: {
    name: "AP World History",
    color: "#c1552c",
    units: [
      {
        id: 1,
        title: "Unit 1: The Global Tapestry (1200–1450)",
        videoId: "xDkPq5KcbS4",
        explanation: "This unit surveys the state of the world's major civilizations just before 1450, before extensive global interconnection. It covers Song Dynasty China (Neo-Confucianism, the scholar-gentry and civil service exams, technological innovation like gunpowder and printing, and the tributary system), the Dar al-Islam (the political fragmentation of the Abbasid Caliphate but continued cultural and economic vibrancy across trade networks), Sub-Saharan African states (Mali under Mansa Musa and the gold-salt trade, and the Swahili coast city-states and Great Zimbabwe), the Americas (the Maya city-states, the Mexica/Aztec Triple Alliance, and the Inca Empire with its road system and mit'a labor system), and developments in Europe (feudalism, the Catholic Church's authority, and the Byzantine Empire).",
        quiz: [
          { q: "Which system did Song Dynasty China use to select government officials based on merit rather than birth?", choices: ["The mit'a system", "The civil service examination system", "The tributary system only", "Feudal vassalage"], answer: 1, explain: "The civil service exam system, rooted in Confucian classics, allowed men (in theory, regardless of birth) to become scholar-officials based on merit." },
          { q: "Mansa Musa, famous for his pilgrimage to Mecca, ruled which West African empire?", choices: ["Ghana", "Mali", "Songhai", "Great Zimbabwe"], answer: 1, explain: "Mansa Musa ruled the Mali Empire and became legendary for the wealth (largely gold) he displayed on his hajj to Mecca." },
          { q: "What was the mit'a system, used by the Inca Empire?", choices: ["A form of currency based on cacao beans", "A rotational labor tax requiring communities to work on state projects", "A system of tribute payments in silk", "A religious pilgrimage requirement"], answer: 1, explain: "The mit'a was a labor tax system where communities provided rotating labor for state projects like roads, terraces, and buildings, in lieu of monetary tribute." },
          { q: "Which best describes the political condition of the Dar al-Islam (Islamic world) around 1200–1450?", choices: ["It was unified under a single, powerful caliph", "It was politically fragmented into multiple competing states, though culturally and economically connected", "It had completely collapsed with no functioning states", "It was ruled directly by the Mongol Empire the entire period"], answer: 1, explain: "While the Abbasid Caliphate's political unity had fractured into regional states (like the Mamluks and various sultanates), the Islamic world remained a connected cultural and economic zone via trade and shared faith." },
          { q: "Which East African coastal region became a network of wealthy trading city-states that blended African, Arab, and Islamic influences?", choices: ["The Swahili Coast", "The Sahel", "The Maghreb", "The Nile Delta"], answer: 0, explain: "Swahili Coast city-states like Kilwa and Mombasa grew wealthy through Indian Ocean trade and blended Bantu African culture with Arab and Islamic influences." }
        ]
      }
    ]
  },
  calcbc: {
    name: "AP Calculus BC",
    color: "#3a6ea5",
    units: [
      {
        id: 1,
        title: "Unit 1: Limits and Continuity",
        videoId: "SVb9OV0bLzI",
        explanation: "This unit builds the foundation for calculus: the concept of a limit, which describes the value a function approaches as the input approaches some value. It covers estimating limits from graphs and tables, evaluating limits algebraically (factoring, rationalizing, direct substitution), one-sided limits and when a limit fails to exist, limits at infinity and horizontal asymptotes, and the formal definition of continuity (a function is continuous at a point if the limit exists, the function is defined there, and they are equal). It also introduces the Intermediate Value Theorem and the difference between removable and non-removable discontinuities.",
        quiz: [
          { q: "For the limit of f(x) as x approaches c to exist, what must be true?", choices: ["f(c) must be defined", "The left-hand and right-hand limits as x approaches c must both exist and be equal", "The function must be continuous everywhere", "The function must be a polynomial"], answer: 1, explain: "A two-sided limit exists only if the left-hand limit and right-hand limit both exist and are equal to each other (f(c) itself doesn't need to be defined)." },
          { q: "Which condition is NOT required for a function f to be continuous at x = c?", choices: ["f(c) is defined", "The limit of f(x) as x approaches c exists", "The limit as x approaches c equals f(c)", "f must be differentiable at c"], answer: 3, explain: "Continuity requires f(c) defined, the limit existing, and the limit equaling f(c) — differentiability is a stronger condition not required for mere continuity." },
          { q: "What technique is most useful for evaluating a limit like lim(x→2) (x²-4)/(x-2), which gives 0/0 by direct substitution?", choices: ["Using L'Hôpital's rule only", "Factoring and canceling common factors", "Concluding the limit does not exist", "Multiplying by the conjugate only"], answer: 1, explain: "Factoring (x²-4) as (x-2)(x+2) lets you cancel the (x-2) term with the denominator, removing the 0/0 indeterminate form and revealing the limit is 4." },
          { q: "The Intermediate Value Theorem guarantees that a continuous function on [a,b] takes on every value between f(a) and f(b). What is required for the theorem to apply?", choices: ["The function must be continuous on the closed interval [a,b]", "The function must be increasing on [a,b]", "The function must have a removable discontinuity", "The function must be a polynomial of degree 2 or less"], answer: 0, explain: "The IVT only requires continuity on the closed interval [a,b]; it does not require the function to be monotonic or of any particular type." },
          { q: "A discontinuity that can be 'fixed' by simply redefining the function at a single point (a hole in the graph) is called a:", choices: ["Jump discontinuity", "Infinite discontinuity", "Removable discontinuity", "Oscillating discontinuity"], answer: 2, explain: "A removable discontinuity appears as a hole in the graph where the limit exists but doesn't match f(c) (or f(c) is undefined); redefining that one point removes it." }
        ]
      }
    ]
  }
};

const SAT_QUESTIONS = [
  { id: 1, section: "Math", q: "If 3x + 7 = 22, what is the value of x?", choices: ["5", "6", "7", "15"], answer: 0, explain: "Subtract 7 from both sides: 3x = 15. Divide by 3: x = 5." },
  { id: 2, section: "Math", q: "What is the slope of the line represented by the equation 2y = 4x + 6?", choices: ["1", "2", "3", "4"], answer: 1, explain: "Divide both sides by 2 to get y = 2x + 3, which is in slope-intercept form (y = mx + b), so the slope m = 2." },
  { id: 3, section: "Math", q: "A rectangle has a length that is 3 more than twice its width. If the width is w, what expression represents the perimeter?", choices: ["2w + 3", "4w + 3", "6w + 6", "2w + 6"], answer: 2, explain: "Length = 2w + 3. Perimeter = 2(length + width) = 2(2w + 3 + w) = 2(3w + 3) = 6w + 6." },
  { id: 4, section: "Math", q: "If f(x) = x² - 2x + 1, what is f(3)?", choices: ["2", "4", "6", "9"], answer: 1, explain: "f(3) = 3² - 2(3) + 1 = 9 - 6 + 1 = 4." },
  { id: 5, section: "Math", q: "What percent of 80 is 20?", choices: ["20%", "25%", "40%", "50%"], answer: 1, explain: "20/80 = 0.25 = 25%." },
  { id: 6, section: "Math", q: "The average (arithmetic mean) of 4, 8, and x is 9. What is the value of x?", choices: ["13", "14", "15", "16"], answer: 2, explain: "(4 + 8 + x)/3 = 9, so 12 + x = 27, meaning x = 15." },
  { id: 7, section: "Math", q: "Solve for x: |2x - 4| = 10", choices: ["x = 3 or x = -3", "x = 7 or x = -3", "x = 7 or x = 3", "x = -7 or x = 3"], answer: 1, explain: "2x - 4 = 10 gives x = 7. 2x - 4 = -10 gives x = -3." },
  { id: 8, section: "Reading", q: "In most passages, the primary purpose of an author's use of a rhetorical question is most likely to:", choices: ["Provide a definitive answer to a complex issue", "Engage the reader and emphasize a point without expecting a literal answer", "Cite statistical evidence", "Contradict the passage's main argument"], answer: 1, explain: "Rhetorical questions are typically used to provoke thought and emphasize a point, not to solicit an actual answer." },
  { id: 9, section: "Reading", q: "When a passage shifts from a broad, general statement to a specific example, this structure is best described as:", choices: ["Compare and contrast", "Cause and effect", "General to specific", "Chronological order"], answer: 2, explain: "Moving from a broad claim to a specific supporting example is a general-to-specific (or deductive) organizational structure." },
  { id: 10, section: "Reading", q: "If an author's tone is described as 'skeptical,' the author most likely:", choices: ["Fully agrees with the claims presented", "Expresses doubt or questions the validity of claims presented", "Is entirely neutral and detached", "Is expressing strong enthusiasm"], answer: 1, explain: "A skeptical tone indicates the author doubts or questions the validity of the ideas being discussed." },
  { id: 11, section: "Writing", q: "Choose the option that correctly fixes the sentence: \"Each of the students have completed their assignment.\"", choices: ["Each of the students have completed his or her assignment.", "Each of the students has completed their assignment.", "Each of the students has completed his or her assignment.", "No change needed."], answer: 2, explain: "'Each' is singular, so it takes the singular verb 'has' and the singular pronoun phrase 'his or her' for subject-verb and pronoun agreement." },
  { id: 12, section: "Writing", q: "Which sentence uses correct punctuation?", choices: ["I wanted to go to the store, however, it was closed.", "I wanted to go to the store; however, it was closed.", "I wanted to go to the store however it was closed.", "I wanted to go to the store: however, it was closed."], answer: 1, explain: "A semicolon is needed before a conjunctive adverb like 'however' that joins two independent clauses, followed by a comma." },
  { id: 13, section: "Writing", q: "Select the most concise and clear revision of: \"Due to the fact that it was raining, the game was postponed.\"", choices: ["Due to the fact that it was raining, the game was postponed.", "Because it was raining, the game was postponed.", "Being that it was raining, the game was postponed.", "In light of the fact it was raining, the game got postponed."], answer: 1, explain: "'Because' is a concise substitute for the wordy phrase 'due to the fact that.'" },
  { id: 14, section: "Math", q: "If 5^(x) = 125, what is the value of x?", choices: ["2", "3", "4", "5"], answer: 1, explain: "125 = 5³, so x = 3." },
  { id: 15, section: "Math", q: "A jar contains only red and blue marbles in a ratio of 3:5. If there are 24 red marbles, how many total marbles are in the jar?", choices: ["40", "56", "64", "72"], answer: 2, explain: "3 parts = 24, so 1 part = 8. Total parts = 3+5 = 8, so total = 8 × 8 = 64." },
  { id: 16, section: "Reading", q: "An author who presents multiple perspectives on an issue before stating their own view is most likely trying to:", choices: ["Confuse the reader", "Appear balanced and build credibility before arguing a position", "Avoid taking any position at all", "Fill space in the passage"], answer: 1, explain: "Presenting multiple viewpoints before offering a conclusion is a common rhetorical strategy to build credibility (ethos) and appear fair-minded." },
  { id: 17, section: "Writing", q: "Which choice best combines the sentences: \"The team practiced for weeks. They still lost the championship.\"", choices: ["The team practiced for weeks, they still lost the championship.", "The team practiced for weeks, but still lost the championship.", "The team practiced for weeks still lost the championship.", "The team practiced for weeks; still, they lost the championship, and it was close."], answer: 1, explain: "Using the coordinating conjunction 'but' with a comma correctly joins the two related, contrasting ideas into one clear sentence." },
  { id: 18, section: "Math", q: "What is the value of x in the equation (x/4) + 3 = 9?", choices: ["12", "18", "24", "36"], answer: 2, explain: "Subtract 3: x/4 = 6. Multiply by 4: x = 24." },
  { id: 19, section: "Math", q: "If two angles of a triangle measure 50° and 60°, what is the measure of the third angle?", choices: ["60°", "70°", "80°", "90°"], answer: 1, explain: "The angles of a triangle sum to 180°. 180 - 50 - 60 = 70°." },
  { id: 20, section: "Reading", q: "The term 'counterargument' in an argumentative passage refers to:", choices: ["Evidence that fully supports the author's thesis", "An opposing viewpoint the author acknowledges, often to then refute it", "A summary of the entire passage", "The passage's title"], answer: 1, explain: "A counterargument is an opposing point of view that a writer often raises specifically in order to address or refute it, strengthening their own argument." }
];
