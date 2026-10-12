import Link from "next/link";
export default function Home() {
  return (
    <main className="heritage-home">
      <section className="heritage-hero">
        <div>
          <span className="eyebrow">लुहाच परिवार · OUR SHARED ROOTS</span>
          <h1>
            Many branches.
            <br />
            One living story.
          </h1>
          <p className="heritage-hindi">
            अपनी जड़ों से जुड़ें। हर रिश्ते को जगह दें।
          </p>
          <p>
            Preserve a village memory. Find your place in the family. Carry our
            shared story forward—with daughters, mothers and both sides of every
            family included.
          </p>
          <div className="hub-actions">
            <Link className="button primary" href="/members">
              Find my family / अपना परिवार
            </Link>
            <Link className="button" href="/community">
              Explore the community →
            </Link>
          </div>
          <small>
            Local review version · member information is shared by consent.
          </small>
        </div>
        <figure>
          <img
            src="/heritage/gathering.webp"
            alt="A community gathering preserved from the earlier Luhach website"
          />
          <figcaption>
            From the earlier community archive · identities and date unverified
          </figcaption>
        </figure>
      </section>
      <section className="heritage-stats">
        <div>
          <strong>46</strong>
          <span>Village histories / गाँव</span>
        </div>
        <div>
          <strong>10,061</strong>
          <span>Preserved family records</span>
        </div>
        <div>
          <strong>Every branch</strong>
          <span>Daughters, mothers & married families</span>
        </div>
      </section>
      <section className="heritage-intro">
        <span className="eyebrow">A FAMILY ARCHIVE THAT CAN GROW</span>
        <h2>What would you like to discover?</h2>
        <div className="hub-grid">
          {[
            [
              "01",
              "Our villages",
              "Read the histories of the places our families call home.",
              "/community",
            ],
            [
              "02",
              "Our family tree",
              "Trace recorded connections and help fill missing branches.",
              "/members",
            ],
            [
              "03",
              "Our people, everywhere",
              "Find consenting members by city, state or country.",
              "/community",
            ],
            [
              "04",
              "Stories worth keeping",
              "Contribute photographs, biographies and village memories.",
              "/community",
            ],
            [
              "05",
              "Ask the archive",
              "Explore sources with the history assistant and relationship tracer.",
              "/community",
            ],
            [
              "06",
              "Your trust matters",
              "Choose who sees your profile. Verify before contributing.",
              "/members",
            ],
          ].map(([n, title, body, href]) => (
            <Link className="heritage-feature" key={n} href={href}>
              <span>{n}</span>
              <h3>{title}</h3>
              <p>{body}</p>
              <strong>Explore →</strong>
            </Link>
          ))}
        </div>
      </section>
      <section className="heritage-band">
        <h2>A daughter’s story belongs in the tree.</h2>
        <p>
          One person, connected to her birth family and married family. New
          information keeps its source, receives community review and can be
          corrected without erasing its history.
        </p>
        <Link className="button" href="/members">
          Help complete your branch →
        </Link>
      </section>
      <section className="heritage-intro">
        <h2>Built with care, together.</h2>
        <div className="hub-three">
          <p>
            <strong>Verify the connection.</strong>
            <br />A trusted reviewer checks your link to a family profile.
            Verification is independent of signing in.
          </p>
          <p>
            <strong>Share by choice.</strong>
            <br />
            New profiles begin private. Children stay private. City discovery
            and contacts each require consent.
          </p>
          <p>
            <strong>Keep the evidence.</strong>
            <br />
            Sources travel with contributions. An objection pauses acceptance so
            a reviewer can resolve the conflict.
          </p>
        </div>
      </section>
    </main>
  );
}
