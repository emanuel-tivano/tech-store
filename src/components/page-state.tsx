interface PageStateProps {
  title: string;
  description?: string;
  variant?: 'default' | 'danger';
}

export function PageState({
  title,
  description,
  variant = 'default',
}: PageStateProps) {
  const className =
    variant === 'danger'
      ? 'status-panel status-panel-danger'
      : 'status-panel';

  return (
    <div className={className} role={variant === 'danger' ? 'alert' : 'status'}>
      <h2 className="mb-2 text-xl font-semibold">{title}</h2>
      {description ? <p className="text-slate-600">{description}</p> : null}
    </div>
  );
}
