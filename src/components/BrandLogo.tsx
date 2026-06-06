export default function BrandLogo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative flex h-10 shrink-0 items-center justify-center overflow-hidden rounded-[14px] bg-gradient-to-br from-[#5a9ff8] to-[#3182f6] px-2.5 shadow-[0_4px_14px_rgba(49,130,246,0.32)] ring-1 ring-white/25">
        <div className="pointer-events-none absolute -right-0.5 -top-0.5 h-4 w-4 rounded-full bg-white/25 blur-[2px]" />
        <span className="relative select-none text-[10px] font-extrabold leading-none tracking-[-0.02em] text-white">
          AirPick
        </span>
      </div>

      <h1 className="text-[1.125rem] font-bold tracking-[-0.04em]">
        <span className="text-ink">에어</span>
        <span className="bg-gradient-to-r from-brand to-[#5a9ff8] bg-clip-text text-transparent">
          픽
        </span>
      </h1>
    </div>
  );
}
