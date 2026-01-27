import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ProjectView from "./project-view";

export default async function ProjectPage({
  params,
}: {
  params: { id: string };
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/");
  }

  return <ProjectView projectId={parseInt(params.id)} token={token} />;
}
