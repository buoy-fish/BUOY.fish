<p class="lead">
  In September 2024, BUOY.fish partnered with the Global Ghost Gear Initiative (GGGI),
  Pro Natura, Fedecoop, and the Ocean Conservancy to deploy 80 GPS-enabled smart buoys
  in Punta Abreojos, Baja California Sur, Mexico — the largest single deployment of
  connected fishing gear tracking technology in history.
</p>

<h3>The Scale of Ghost Gear</h3>

<p>
  Research published in <em>Science Advances</em> estimates that more than
  <strong>25 million pots and traps are lost to the ocean annually</strong>. Industry
  analysts put loss rates at 10-20% of deployed gear each year. In the Mid-Atlantic region
  alone, derelict crab pots kill an estimated 3.3 million blue crabs annually. Unlike other
  ocean debris, lost pots and traps continue to catch and kill their target species for
  years — a problem known as "ghost fishing."
</p>

<p>
  Punta Abreojos is home to a federation of 12 fishing cooperatives, each representing
  20-40 fishermen, with an estimated 25,000 buoys in the region's lobster and verdillo
  fisheries. Self-reported gear loss rates hover around 2.5% per year, but industry
  averages suggest the true number may be far higher.
</p>

<h3>Building the Network</h3>

<p>
  Before deploying a single buoy, we had to build wireless coverage from scratch. The
  BUOY team — Tal McGowan, Jameson Buffmire, and Andrew Buffmire — traveled to Punta
  Abreojos to install LoRaWAN infrastructure across the region.
</p>

<p>
  We deployed three high-power outdoor LoRaWAN towers with 8dBi antennas and three
  low-power indoor gateways, installed at Fedecoop's regional headquarters, an estuary
  outpost, and Black Bass Lodge's beachfront property. To validate coverage, we installed
  10 mapping devices on local panga boats, confirming reliable connectivity up to 15 miles
  offshore with regular pings exceeding 40 miles in ideal conditions.
</p>

<p>
  The key learning: antenna height is the single most important factor for range. A 65-foot
  tower with an omnidirectional antenna dramatically outperformed lower-mounted directional
  alternatives, even those with higher gain specifications.
</p>

<h3>Smart Buoys in the Water</h3>

<p>
  With coverage established, we assembled, programmed, and onboarded 80 connected spindles
  — GPS-enabled smart buoys designed to be integrated into existing lobster fishing gear.
  Each buoy broadcasts its position over the LoRaWAN network, providing fishermen with
  24/7 location awareness through our <a href="https://app.buoy.fish">tracking app</a>.
</p>

<p>
  The deployment began with a presentation to the fishing community. Fishermen were
  immediately engaged and enthusiastic. We worked together to refine the product in the
  field, including adjustments to the weighted shackle design based on direct feedback
  from the cooperative members who would be using them daily.
</p>

<h3>The Results</h3>

<p>
  By December 2024, three months into the deployment:
</p>

<ul>
  <li><strong>160,000+ location payloads</strong> recorded in our database</li>
  <li><strong>62 out of 70 deployed units</strong> broadcasting within the last 24 hours</li>
  <li><strong>20 satellite-enabled buoys</strong> reporting via Omnispace S-Band link, with 514 satellite transmissions received</li>
  <li>Local fishermen had begun <strong>painting BUOY buoys in their traditional colors</strong> — a powerful signal of adoption into their daily workflow</li>
</ul>

<p>
  That last detail matters more than any technical metric. Juan Jose Cota Nieto ("Chancho"),
  a marine wildlife biologist at Fedecoop, flagged this to our team as a milestone: when
  fishermen personalize the equipment, it means they've accepted it as their own.
</p>

<h3>Satellite Communications</h3>

<p>
  Alongside the LoRaWAN deployment, we began testing direct-to-satellite communications
  via Omnispace's S-Band network. This is critical for gear deployed far offshore, beyond
  the reach of terrestrial coverage. The Omnispace satellites pass over the Punta Abreojos
  region 2-3 times per day, and at any given time can cover a quarter to a third of the
  earth's surface.
</p>

<p>
  Early results showed the potential — one buoy ("Ranger") transmitted 376 satellite payloads
  alone — while also revealing hardware refinements needed around antenna design in the
  potting compound that waterproofs our electronics.
</p>

<h3>What This Proved</h3>

<p>
  The Punta Abreojos deployment validated that connected fishing gear tracking can work
  at commercial scale, in a remote region, at a fraction of the cost of satellite-only
  alternatives. Traditional satellite buoys can exceed $2,000 in hardware plus $30-100/month
  per device. BUOY.fish SmartBuoys cost a fraction of that, with LoRa network fees measured
  in fractions of a cent per packet.
</p>

<p>
  The $45,000 pilot — funded by GGGI ($20,000) and Schmidt Marine Technology Partners
  ($25,000) — demonstrated that the technology works, fishermen want it, and the economics
  make sense for widespread adoption. These results directly informed our expansion to
  <a href="/blog/nova-scotia-trial">Nova Scotia</a> and our upcoming deployment in
  <a href="/blog/punta-eugenia-isla-natividad">Punta Eugenia and Isla Natividad</a>.
</p>

<p>
  Interested in deploying BUOY.fish in your fishery?
  <a href="/contact_us">Get in touch</a>, or
  <a href="https://app.buoy.fish/demo">try the live demo</a>.
</p>
