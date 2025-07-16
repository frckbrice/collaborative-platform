import * as React from 'react';

export interface ITileSectionProps {
  title?: string;
  subHeading?: string;
  pill: string;
}

export function TitleSection({ title, subHeading, pill }: ITileSectionProps) {
  return (
    <React.Fragment>
      <section className=" flex flex-col gap-4 justify-center items-start md:items-center">
        <article className=" rounded-full p-[1px] text-sm dark:bg-gradient-to-r dark:from-brand-primaryBlue dark:to-brand-primaryPurple">
          <div className="rounded-full px-3 py-1 dark:bg-black text-[28px] font-semibold dark:text-white">{pill}</div>
        </article>
        {subHeading ? (
          <>
            <h2 className=" text-left text-3xl sm:text-5xl sm:max-w-[750px] md:text-center font-semibold ">
              {title}
            </h2>
            <p className=" dark:text-washed-purple-700 sm:max-w-[450px] md:text-center">
              {subHeading}
            </p>
          </>
        ) : (
          <h1 className=" text-left text-4xl sm:text-6xl sm:max-w-[850px] sm:text-center font-semibold">
            {title}{' '}
          </h1>
        )}
      </section>
    </React.Fragment>
  );
}
