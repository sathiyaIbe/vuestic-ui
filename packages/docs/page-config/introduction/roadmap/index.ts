import { RoadmapItem } from "./types";

export default definePageConfig({
  blocks: [
    block.title("roadmap.title"),
    block.paragraph("roadmap.description"),
    block.subtitle("roadmap.inDevelopment.title"),
    block.paragraph("roadmap.inDevelopment.description"),

    block.headline("roadmap.1-7.title"),
    block.paragraph("roadmap.1-7.description"),

    block.component("Roadmap", {
      roadmap: [
        {
          title: "Color Picker",
          type: "component",
          image: "colorPicker",
        },
        {
          title: "Accessability Improvements",
          type: "other",
        },
        {
          title: "Docs Improvements",
          type: "other",
        }
      ] as RoadmapItem[],
    }),

    block.subtitle("roadmap.released.title"),

    block.headline("roadmap.1-6.title"),
    block.paragraph("roadmap.1-6.description"),

    block.component("Roadmap", {
      roadmap: [
        {
          title: "Create Vuestic",
          type: "service",
          link: "https://github.com/epicmaxco/vuestic-ui/pull/2828",
          image: "createVuestic",
        },
        {
          title: "Skeleton",
          type: "component",
          link: "https://github.com/epicmaxco/vuestic-ui/pull/2918",
          image: "Skeleton",
        },
        {
          title: "Auto Complete",
          type: "component",
          link: "https://github.com/epicmaxco/vuestic-ui/issues/2228",
          image: "autoComplete",
        },
        {
          title: "Breakpoints",
          type: "service",
          link: "https://github.com/epicmaxco/vuestic-ui/pull/2189",
          image: "breakpoints",
        },
        {
          title: "Stepper",
          type: "component",
          link: "https://github.com/epicmaxco/vuestic-ui/pull/2906",
          image: "stepper",
        },
        {
          title: "Tailwind Integration",
          type: "other",
          link: "https://github.com/epicmaxco/vuestic-ui/pull/2745",
          image: "tailwind",
        },
        {
          title: "Docs improvements",
          type: "other",
        },
      ] as RoadmapItem[],
    }),

    block.headline("roadmap.1-5.title"),
    block.paragraph("roadmap.1-5.description"),

    block.component("Roadmap", {
      roadmap: [
        {
          title: "Dark theme",
          type: "service",
          link: "https://github.com/epicmaxco/vuestic-ui/pull/1865",
          image: "DarkTheme",
        },
        {
          title: "Component Presets",
          type: "service",
          link: "https://github.com/epicmaxco/vuestic-ui/issues/1806",
          image: "Presets",
        },
        {
          title: "CSS Helpers",
          type: "service",
          link: "https://github.com/epicmaxco/vuestic-ui/pull/1890",
          image: "CSSHelpers",
        },
        {
          title: "TreeView",
          type: "component",
          link: "https://github.com/epicmaxco/vuestic-ui/pull/1728",
          image: "TreeView",
        },
        {
          title: "Dropdown",
          type: "component",
          link: "https://github.com/epicmaxco/vuestic-ui/pull/2109",
          image: "Dropdown",
        },
        {
          title: "SplitPanel",
          type: "component",
          link: "https://github.com/epicmaxco/vuestic-ui/pull/2068",
          image: "SplitPanel",
        },
        {
          title: "Button redesign",
          type: "redesign",
          link: "https://github.com/epicmaxco/vuestic-ui/pull/1945",
          image: "Buttons",
        },
        // {
        //   title: 'Breakpoints',
        //   type: 'service',
        //   link: 'https://github.com/epicmaxco/vuestic-ui/pull/1945',
        //   image: 'Breakpoints',
        // },
        {
          title: "Attributes Config",
          type: "service",
          link: "https://github.com/epicmaxco/vuestic-ui/issues/1954",
          image: "AttributesConfig",
        },
      ] as RoadmapItem[],
    }),

    block.headline("roadmap.1-4.title"),
    block.paragraph("roadmap.1-4.description"),

    block.headline("roadmap.1-3.title"),
    block.paragraph("roadmap.1-3.description"),

    block.headline("roadmap.1-2.title"),
    block.paragraph("roadmap.1-2.description"),

    block.headline("roadmap.1-1.title"),
    block.paragraph("roadmap.1-1.description"),

    block.headline("roadmap.1-0.title"),
    block.paragraph("roadmap.1-0.description"),

    block.headline("roadmap.0-1.title"),
    block.paragraph("roadmap.0-1.description"),
  ],
});
