import React from 'react';

export function StaticPage({ title, intro, sections }) {
  return (
    <main className='content'>
      <section className='card static-page'>
        <h1>{title}</h1>
        {intro && <p className='static-intro'>{intro}</p>}
        <div className='static-sections'>
          {sections.map((section) => (
            <article key={section.heading} className='static-section'>
              <h2>{section.heading}</h2>
              {section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              {section.items?.length ? (
                <ul>
                  {section.items.map((item) => <li key={item}>{item}</li>)}
                </ul>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
