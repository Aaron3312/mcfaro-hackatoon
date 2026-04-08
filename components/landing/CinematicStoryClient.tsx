"use client";
// Wrapper cliente para CinematicStory — necesario para usar ssr:false en next/dynamic
import dynamic from "next/dynamic";

const CinematicStory = dynamic(
  () => import("./CinematicStory").then((m) => m.CinematicStory),
  { ssr: false }
);

export function CinematicStoryClient() {
  return <CinematicStory />;
}
