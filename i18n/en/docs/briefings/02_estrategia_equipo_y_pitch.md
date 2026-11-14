<!-- i18n-header -->
> 🌐 **Language:** **English** · [Español](../../../es/docs/briefings/02_estrategia_equipo_y_pitch.md) · [中文](../../../zh/docs/briefings/02_estrategia_equipo_y_pitch.md) · [Deutsch](../../../de/docs/briefings/02_estrategia_equipo_y_pitch.md) · [Italiano](../../../it/docs/briefings/02_estrategia_equipo_y_pitch.md)
> 🕒 **Documentation date:** 2026-11-14 15:35 · **Source:** `docs/briefings/02_estrategia_equipo_y_pitch.md`
> ⚠️ Machine-translated draft, pending native-speaker review.
<!-- /i18n-header -->

# Audio 2 of 2 — SPHEREx: strategy, team and pitch

Preparation material for Juan Pablo, on the way to the NASA Space Apps Challenge 2026, where his
six-person team from the astronomy lab will take on the **Planet X and SPHEREx** challenge.

This is the second of two audios. The first covers what the challenge asks for and what data you work with.
This one covers **how to organize, what to build first, what the jury rewards and how to present it**.

The underlying idea: in a hackathon, the winning project is almost never the one with the most code. It is
the one that arrives whole.

---

## 1. The hidden rubric: the eight suggestions in the statement

The challenge includes a "potential considerations" section with eight bullets that says you
"may, but are not required to" consider. In practice **they are the rubric**: they are what the challenge
author expects to set a good project apart, and what a NASA judge will recognize.

The eight are: that the tool be easy to update when new data arrives; creatively showing
all 102 infrared bands, with an explicit bonus if spectra are generated on the fly; allowing the user to
add or subtract images taken at different epochs; letting the user choose the field of
view; allowing overlays of data from other telescopes such as Gaia or WISE; **being able to query the
tool by including the coordinates in the URL**, so it can be embedded in other sites;
showing metadata such as contamination flags; and using existing public tools,
explicitly naming Astropy and Aladin.

The interesting part: **seven of the eight are low or very low cost.** The only truly expensive one is the
102 bands, which is precisely the differentiator. So all of them must be met, and there is an order
for doing so.

---

## 2. The architecture: two paths, and you need both

The project has a fast path and a complete one, and the key is that **the fast one really exists**.

**Path A** is Aladin Lite loading the Data Release 1 all-sky cube directly, which
is published in HiPS format. The user navigates the sky and moves a wavelength slider.
Zero backend. It gives the 102 bands, the all-sky context and catalog overlays. What it does not
give is the time axis, because the cube is a combined mosaic, not a series of epochs. Cost:
hours, not days. Low technical risk.

**Path B** is the temporal blink, with a backend. The server queries the archive by position,
requests cutouts of each epoch, groups them by band, normalizes them and returns a sequence ordered
in time. It is the challenge proper and the bulk of the work. Its bottleneck is the
latency of the cutouts: without a cache, the demo does not survive.

**The two paths are mounted on the same screen**, side by side: Aladin gives the context and the wavelength,
a panel next to it gives the temporal blink. The user immediately understands that they are two axes of the
same data.

And path A is the project's insurance: if the backend does not arrive in time, there is still something real to
show.

The chosen stack: Python with FastAPI on the backend, because the libraries that can read this
data exist only in Python; React with Vite and Aladin Lite on the frontend; disk cache; and
frontend deployment on Vercel, with the backend still to be decided (Vercel Functions or a container, depending on the measured time of a cutout).

A design decision that saves a lot of work: **the backend returns already-rendered PNG images,
not FITS files.** Sending FITS to the browser forces you to write a FITS reader in JavaScript and to
apply the stretch and the color map by hand: double the work and triple the errors. The
cost is that changing the stretch requires going back to the server, and with a cache that is cheap.

And a detail that seems minor and is not: **all the frames of a sequence are normalized with
the same limits.** If each one is stretched on its own, everything flickers and you cannot tell
real motion from a change of scale.

---

## 3. The first thing to pin down: the API contract

This is what lets six people move in parallel from the first hour.

In hour one the contract is written: which endpoints exist, which parameters they take and what they return
exactly. While the backend does not exist, the frontend works against a simulator that returns
those same shapes. Nobody waits for anybody.

And the rule that holds it up: **if someone changes the contract, they change it first in the document**,
notify the team, and only then touch the code. A silent contract change blocks someone else
without their knowing, and at three in the morning that costs hours.

Two contract fields worth mentioning. One: each frame returns **its wavelength**,
and that is not optional: it is what prevents the linear variable filter problem and, shown on
screen, it demonstrates to the jury that the team understands the instrument. And two: warnings
travel as a list, not as an error. Bands are missing constantly; if that breaks the request, the
tool does not work.

---

## 4. Six people, their agents, and the real risk

The main risk for a team of six with AI assistants is not running out of ideas. It is
**stepping on each other**. Several agents writing fast on the same repository produce conflicts,
duplicated code and a broken main branch in the small hours.

The proposed split is four roles, each the owner of certain files. Owner means that this
person decides and the others ask; it does not mean they work alone.

**Data**: queries the archive, downloads cutouts, reads the FITS, groups by band, resolves
coordinates and wavelengths. It is the critical path: if this does not work, there is no project.

**Viewer**: Aladin Lite, the blink panel, the controls, the queryable URL.

**Science and verification**: checks that what is shown is correct. That the cutout is of the sky it
says it is, that the object is where Gaia predicts, that the spectrum is not an artifact. **They are the one
with explicit permission to say "this is wrong" without having to propose the fix.**

**Narrative and delivery**: the README, the demo, the pitch and the form. And they start working from
hour zero, not at the end. The classic hackathon mistake is leaving the delivery for the last two hours
and discovering that half of the form is missing.

From hour twelve on, when the critical path is unblocked, data and viewer split the extra
bullets. But science and narrative do not dissolve: if nobody verifies and nobody prepares the
delivery, the project is delivered late and with errors.

On code: short branches that live less than three hours, nobody pushes to the main branch, and
every change is reviewed by a person —not an agent—, because looking at a diff takes two minutes and saves
hours. And worktrees: one folder per person, because two agents on the same folder
overwrite each other without warning and neither of them will say so.

---

## 5. How to use an agent without the agent beating you

This is what separates a team that uses agents from one that the agents beat. There are five
habits.

**One session per front.** Do not mix the data backend with the frontend in the same session: the
context gets contaminated and the assistant starts making silly mistakes.

**The agent proposes, the person decides.** For anything that touches more than two files: plan
first, approval after. In a hackathon the temptation to let it run is enormous, and it is the fastest
way to end up with two thousand lines that nobody understands at five in the morning.

**Verify the artifact, not the report.** The agent saying "it works now" is a data point, not a fact.
You have to open the URL, look at the image, count the epochs. It is not distrust: it is that the agent cannot
see the screen.

**When something does not work on the third try, change the approach, not the prompt.** If you have spent three attempts
fixing the same thing, the problem is not how you asked for it.

And **never let an agent decide the scope on its own.** An agent, if you let it, builds all eight
bullets of the challenge halfway instead of three completely.

---

## 6. The plan by blocks, and where the cuts are

The rhythm is blocks of ninety minutes, and at the end of each one, five minutes standing, no
screens, where each person says three things: what is left working —not what they did, but what can be
opened and looked at—, what is blocked and by whom, and what they will do in the next ninety minutes.

Ninety minutes is enough to finish something and short enough that a wrong path does not cost
half the night.

**Hour zero is for aligning.** Read the statement together out loud, split roles, confirm the exact time of
the submission deadline, and bring up the skeleton on all six computers. If the skeleton
does not come up, nobody moves forward until it does.

**Hours one to three are the moment of truth with the data.** Real queries, how many epochs
there are per field, how long a timed cutout takes, and the most important question of the day: how much
the wavelength changes between two epochs of the same field. If the cutouts turn out to be unviable because of
slowness, **the plan changes there, not at hour fifteen**.

**Until hour eight, the critical path**, and the milestone is very concrete: *a hand-typed coordinate
produces a little video on screen*. Ugly, slow, a single band, it does not matter. If at hour eight there is no
little video, everything else is suspended and all six work on that.

**From eight to fourteen, make it good**, in order of value: band selector, then the
controls, then image subtraction, then name resolution, then the shareable URL, then the
Gaia overlay, then the flags, and only if everything above is closed, on-the-fly spectra.

And then come **the three mandatory stops**, which are the only thing that is not negotiable.

Six hours before the deadline: **scope freeze**. Nothing new is started. What has not been
started is not started, and what has been started is finished or removed, because **a half-finished feature
subtracts**: the jury clicks right there.

At four hours: **the recorded demo**, even if the application keeps improving. If it improves later, it is
re-recorded. If there is no time, a video already exists.

At two hours: **submitted**. Form complete, links in place, AI-use statement written.
You can keep editing afterwards, but it is already submitted.

---

## 7. What can go wrong

Ten risks identified; it is worth keeping the first four in mind.

**That the archive cutouts are too slow.** It is the assumption everything rests on.
It is decided at hour three. If they are, plan B is aggressive caching, pre-warming and showing the
frames as they arrive; and plan C is to operate on a curated set of about ten
precomputed fields, saying so openly: today we serve these fields, the architecture scales.

**That the epochs are not comparable because of the linear variable filter.** It is the subtlest risk and the
one most likely to ruin the result without anyone understanding why. The alarm signal is
obvious when it appears: the first blink looks like a strobe light.

**That the wifi goes down.** High probability: it happens at almost every hackathon. Plan B is
mandatory, not optional: a degraded mode that serves the five fields from cache without touching the network,
and the demo video downloaded on the disk of the presenting computer, not in the cloud.

**That the project is submitted late or incomplete.** It is the number one cause of a good project
winning nothing, and it has no plan B. That is why the three stops exist.

And one more that is worth having written down beforehand so as not to reopen it at four in the morning: **no
model will be trained.** There is no time, there are no labels and it is not needed.

---

## 8. Why not video models, and what to answer if asked

It is worth having this clear because someone will ask, inside or outside the team.

Video understanding architectures —TimeSformer, ViViT, VideoMAE, X-CLIP— are models for
understanding natural video. They are pretrained on people, objects and actions. The statistics of an
astronomical sequence —nearly empty background, point sources, artifacts, a shift of a few
pixels— are nothing like that, so the pretraining, which is all of their value, does not transfer
well. In addition there are no labels, and the case is already well solved by classical methods that exploit
the physics of the problem: a linear trajectory over a static background.

The state of the art in automatic detection here is **shift-and-stack**: shifting each image according to
a candidate velocity and stacking them, so that a moving object adds up coherently and the
noise does not. The reference implementation, KBMOD, runs on GPU and explores on the order of ten thousand
million candidate trajectories per minute; with it, the DEEP survey identified 105 new
trans-Neptunian objects. It is expensive and out of reach for 24 hours. Mentioning it as future work
is more honest than attempting it.

**And here is the team's own advantage.** Francisco Förster's lab built ALeRCE,
the Chilean broker that processes the ZTF alert stream and is preparing for LSST. Its stamp
classifier is a convolutional network that works on the science, reference and difference
cutouts of the first detection, designed to exploit rotational invariance. That —a small network
on cutouts, with hand-chosen invariances— **is the right artificial intelligence model for this problem**,
not a video transformer.

But the differentiating contribution is not even putting that classifier in the viewer. It is the **discipline
of real-time classification**: thresholds, false positives, how a dubious candidate is presented to a person,
how the label that person gives is collected. That discipline applied to the interface is something that no other
team at the hackathon will have.

So the answer to the jury, if they ask why machine learning was not used, is: *we
evaluated it; the bottleneck of this challenge is not recognizing motion in a video, it is bringing
and aligning the right data and putting it in front of a person; where AI contributes here is in
candidate screening with small networks on cutouts, which is what the ALeRCE broker does, and we
have left it laid out*. That answer is stronger than having included a model that adds nothing.

---

## 9. The jury: how it is judged and what to aim for

The funnel is: the local event jury picks global nominees; then NASA and partner-agency experts
pick finalists; and an executive committee picks ten global winners.

That is: **the first filter is a local jury**, with little time per team and without reading the code.
After that, people who do understand astronomy. The project has to work in both registers:
make an impact in two minutes and withstand an expert look.

Of the ten global awards, two are natural for this project: **best use of data**, which is
literally making space data accessible, and **best use of science**. A free third one if
you work for it: **best use of storytelling**, because the Pluto story and the blink comparator
are there for the taking. Aim for two or three, not ten.

---

## 10. The two-minute pitch

At the Santiago event the announced format is two minutes plus two questions. Two minutes is
much less than it seems, and it has to be rehearsed out loud and timed, three times.

The structure, and the order is not negotiable because **the demo goes before the explanation**: if they cut
you off, at least they saw the tool.

**Twenty seconds of hook.** In 1930, Clyde Tombaugh discovered Pluto by looking at two photos of the same
patch of sky and noticing that one dot had moved. Today SPHEREx photographs the entire sky every
six months in 102 infrared colors, and nobody is looking at it this way.

**Fifty seconds of live demonstration**, which is half the time and is what gets judged.
Type "WISE 0855" —the name, not the coordinates, to show that it is for anyone—. Press
play and show the subtraction of the first and last image: the brown dwarf moves —a red and blue pair, subtle, and
we say honestly that in a single exposure it looks faint—. Also show eps Ind B, where the motion is seen
more clearly. Move the band selector: the same area at another wavelength.
Turn on the Gaia overlay (WISE 0855 is not in Gaia: there the overlay is CatWISE2020; in Barnard or eps Ind B): the markers fall on the sources, *that is how we know it is correct*.
Copy the URL: this is shareable and embeddable.

**Twenty-five seconds of why it matters.** Most of the known brown dwarfs and comets
were found by volunteers looking at blinks. That community exists and today has no way to
look at SPHEREx. The most cited Planet Nine candidate came from comparing two infrared surveys
separated in time: the same technique.

**And twenty-five seconds of what we built and what comes next.**

Three rules of the pitch. Never demo live against a cold query: the five fields go
pre-warmed. Do not say "could": show what exists. And **do not promise to have found anything**:
a jury with astronomers punishes that instantly.

On Planet Nine, the honest framing: as of November 2026 **it has not been found**. The most
cited candidate is the one that came out of cross-matching the IRAS and AKARI infrared surveys, separated by twenty-three years, and
the authors themselves stress that they have not discovered anything definitive. But the sentence that is
true, verifiable, and a better hook than any promise, is this: **the technique that found that
candidate is exactly the challenge's, and SPHEREx does it every six months, in 102 bands, and nobody
has checked it by eye.**

---

## 11. The uncomfortable questions

Four, with their answers.

**Doesn't the IRSA data explorer already do this?** Not for this audience. The explorer is an
archive for astronomers: you have to know which collection to request, what a multi-extension FITS is and how an image
is stretched. We resolve the name, group the epochs, normalize and deliver the
blink. It is the difference between an archive and a viewer, and it is the same difference that made
WiseView useful compared to the WISE archive.

**How do I know the image is of that coordinate?** By the Gaia overlay. And it is shown on screen.

**What happens if I enter a coordinate with no data?** And one is typed, and the empty state is shown, which
says how many epochs there are and suggests a nearby field. This has to be solved: the jury will
type random coordinates, and a blank screen is a serious failure.

**How correct are the spectra?** They are indicative, aperture photometry with the zodiacal light
subtracted, and we say so in the interface itself. For science there is IRSA's spectrophotometry
tool. Never present them as science quality: honesty here adds
much more than it subtracts.

---

## 12. The mandatory parts of the submission

Three things that are not red tape.

**The description of how artificial intelligence was used is mandatory this year** in every
submission. Written well, it is evidence of method: what the assistants were asked to do, how the
result was controlled, what was not done with them —in particular, that no scientific data was generated or
completed by a model—, and why vision models were reasonably ruled out for
detection. Written badly, it is a wasted opportunity.

**The attribution of the SPHEREx data**, verbatim, in the footer of the tool and in the README. It is
a free point of polish with a NASA jury and costs thirty seconds.

And **the links tested from outside the event wifi**: the video, the deployed application and the
repository, opened from a phone on mobile data. A link that only works on the
local network is a broken link.

---

## 13. What to carry in your head on arrival

Five things.

One: the eight suggestions in the statement are the rubric, seven are cheap, and all of them have to be met
in order of value.

Two: the hour-eight milestone is a little video on screen, however ugly it may be. Everything else is subordinate.

Three: the three stops —freeze at six hours, demo recorded at four, submitted at two— are not
negotiable, because the project that wins is the one that arrives whole.

Four: verify the artifact, not the report. It applies to agents and it applies to people.

And five: the project's angle fits in one sentence. **A viewer where anyone enters a coordinate
and sees two axes at once: how that patch of sky changes over time, and how it looks at each of the
102 wavelengths, with the spectrum of whatever they point at generated on the fly.** That is the
literal reading of the statement, it is its two most demanding bullets, and it is something that no public tool
does today.
