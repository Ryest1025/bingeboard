interface SectionTitleProps {
  title: string;
  subtitle?: string;
  badge?: string;
  className?: string;
}

export default function SectionTitle({ 
  title, 
  subtitle, 
  badge, 
  className = "" 
}: SectionTitleProps) {
  return (
    <div className={`flex items-center gap-3 mb-6 ${className}`}>
      <h2 className="text-2xl md:text-3xl font-bold text-white">
        {title}
      </h2>
      {badge && (
        <span className="bg-primary/20 text-primary border border-primary/30 px-3 py-1 rounded-full text-sm font-medium">
          {badge}
        </span>
      )}
      {subtitle && (
        <p className="text-gray-400 text-lg ml-auto">
          {subtitle}
        </p>
      )}
    </div>
  );
}
