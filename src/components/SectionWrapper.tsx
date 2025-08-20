export type SectionWrapperProps = {
  title: string;
  children: React.ReactNode;
};

export const SectionWrapper: React.FC<SectionWrapperProps> = ({ title, children }) => (
  <section className="mb-4 p-4 rounded-xl bg-white shadow">
    <h2 className="text-lg font-semibold mb-2 text-[#161129]">{title}</h2>
    <div>{children}</div>
  </section>
);
