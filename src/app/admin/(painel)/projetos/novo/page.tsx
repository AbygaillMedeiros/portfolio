import ProjectForm from '@/components/admin/ProjectForm';

export default function NewProjectPage() {
  return (
    <div>
      <h1 className="display-condensed mb-10 text-5xl">Novo projeto</h1>
      <ProjectForm initial={null} />
    </div>
  );
}
