export function ApotekerTopAppBar() {
  return (
    <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-outline-variant/30 h-16 flex items-center justify-between px-margin w-full">
      <div className="flex items-center gap-4">
        <h2 className="font-headline-md text-headline-md font-bold text-primary tracking-tight">Manajemen Apotek</h2>
      </div>
      <div className="flex items-center gap-6">
        <div className="relative">
          <span className="material-symbols-outlined text-on-surface-variant">search</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="w-10 h-10 rounded-lg hover:bg-primary-container/40 flex items-center justify-center text-on-surface-variant transition-all">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="w-10 h-10 rounded-lg hover:bg-primary-container/40 flex items-center justify-center text-on-surface-variant transition-all">
            <span className="material-symbols-outlined">history_toggle_off</span>
          </button>
          <div className="h-8 w-8 rounded-full overflow-hidden border border-outline-variant/50">
            <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAv0n7p8o9ph7suBaEF9pOpT7snNDDJhUhTbYvo6lHG4xfQtaOV5GiwVLCtT08I7gxXaK79YUlX4C-OSkYRukmr6ULXWbg5kbU87Y0EoqD5HDLMtcYDEqx36ILjTmXiUSrW3CL8f8yKK1lztOvCQU0eFfTf0PBD-wguseBNT4MvkGcKFphMo7b544bcBZlmNQjFs_XFmzg8JLAcQATqp5Vk0Uta8-dlGwP6kFqz8SrLy0pHkisVUQAEiLGw_ZJZDWp4DogGqvuvJgeT" alt="Pharmacist profile" />
          </div>
        </div>
      </div>
    </header>
  );
}
