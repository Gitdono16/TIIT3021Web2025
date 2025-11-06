import { Octokit } from "@octokit/rest";
import { Professor } from "../models/Professor";
import { decryptToken } from "../utils/crypto";

async function getOctokitForProfessor(professorId: string) {
    const prof = await Professor.findById(professorId);
    if (!prof) throw new Error("Professeur introuvable dans la base de données.");

    const token = decryptToken({
        iv: prof.githubTokenIv,
        data: prof.githubTokenData,
        tag: prof.githubTokenTag,
    });

    return new Octokit({ auth: token });
}

export async function checkOrganizationExists(professorId: string, organization: string) {
    const octokit = await getOctokitForProfessor(professorId);

    try {
        await octokit.orgs.get({ org: organization });
        return true;
    } catch (error: any) {
        if (error.status === 404) {
            throw new Error(`L'organisation "${organization}" n'existe pas sur GitHub.`);
        }
        throw new Error("Erreur lors de la vérification de l'organisation GitHub.");
    }
}

export async function listOrganizationRepos(professorId: string, organization: string) {
    const octokit = await getOctokitForProfessor(professorId);

    try {
        const { data } = await octokit.repos.listForOrg({
            org: organization,
            type: "all",
            per_page: 100,
        });
        return data.map((repo) => ({ name: repo.name }));
    } catch (error: any) {
        if (error.status === 404) {
            throw new Error(`Impossible de trouver l'organisation "${organization}".`);
        }
        throw new Error("Erreur lors de la récupération des infos de github.");
    }
}

export async function createGithubRepository(
    professorId: string,
    organization: string,
    repoName: string
): Promise<string> {
    const octokit = await getOctokitForProfessor(professorId);

    try {
        const { data } = await octokit.repos.createInOrg({
            org: organization,
            name: repoName,
            private: true,
            auto_init: true,
        });

        console.log(`ok Dépôt: ${data.html_url}`);
        return data.html_url;
    } catch (error: any) {
        if (error.status === 422) {
            throw new Error(`Le dépôt "${repoName}" existe déjà dans l'organisation "${organization}".`);
        }
        throw new Error(
            `Erreur création dépôt GitHub : ${error.message || "Erreur."}`
        );
    }
}

export async function ensureGitHubUserExists(username: string) {
    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

    try {
        await octokit.users.getByUsername({ username });
        return true;
    } catch (error: any) {
        if (error.status === 404) {
            throw new Error(`L'utilisateur GitHub "${username}" nexiste pas.`);
        }
        throw new Error("Erreur lors de la vérification de l'utilisateur GitHub.");
    }
}

export async function addCollaboratorToProjectRepo(
    professorId: string,
    organization: string,
    repoName: string,
    username: string
) {
    const octokit = await getOctokitForProfessor(professorId);

    try {
        await octokit.repos.addCollaborator({owner: organization, repo: repoName, username, permission: "push",
        });

        console.log(`utilisateur ajouté : ${username} → ${organization}/${repoName}`);
    } catch (error: any) {
        if (error.status === 404) {
            throw new Error(
                `impossible d'ajouter "${username}" : depot ou organisation introuvable (${organization}/${repoName}).`
            );
        }
        throw new Error(`Erreur lors de l'ajouts de l'utilisateur "${username}" : ${error.message}`);
    }
}
