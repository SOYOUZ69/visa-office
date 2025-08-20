🐞 Bug report – Dossiers / Services / Paiements

Bug A — Compteurs figés (services / paiements)

Symptôme
	•	Dans la liste des dossiers, les badges “X service(s)” et “Y paiement(s)” ne se mettent pas à jour après ajout/suppression. Ils ne changent qu’après un refresh.

Cause probable
	•	Manque de ré-invalidation des requêtes après mutation (add/delete service/payment).
	•	Les compteurs sont chargés une fois (query) mais jamais ré-fetched.
	•	Clé de cache trop large (pas cléée par dossierId) ou pas d’écoute sur les mutations.

Correctif
	•	Utiliser React Query/SWR avec query keys spécifiques par dossier, ex.:
	•	['dossier','summary', dossierId] (compteurs + total)
	•	['dossier','services', dossierId]
	•	['dossier','payments', dossierId]
	•	Après chaque mutation (create/update/delete service ou payment):
	•	invalidateQueries(['dossier','summary', dossierId])
	•	invalidateQueries(['dossier','services', dossierId]) ou ['dossier','payments', dossierId] selon le cas.
	•	(Optionnel) Faire un optimistic update local puis réconciliation après refetch.

Snippet (exemple React Query)
const qc = useQueryClient();

const addService = useMutation(api.addService, {
  onSuccess: (_, vars) => {
    const id = vars.dossierId;
    qc.invalidateQueries({ queryKey: ['dossier','services', id] });
    qc.invalidateQueries({ queryKey: ['dossier','summary', id] });
  }
});
Bug B — Section “Services” ne suit pas le dossier actif

Symptôme
	•	Quand on change de dossier actif, la section Services n’affiche pas les services du nouveau dossier.
	•	Parfois la liste reste vide même si le dossier sélectionné a des services (nécessite un refresh).

Causes probables
	•	La requête de la section Services n’est pas cléée par dossierId ou le dossierId n’est pas passé dans la dépendance du hook.
	•	Un state local persiste entre deux dossiers (pas reset) → l’UI continue d’afficher l’ancien array.
	•	Le form state ou le cache n’est pas invalidé sur changement de dossier.
	•	Appels API utilisant clientId au lieu de dossierId.

Correctifs
	1.	Source of truth du dossier actif
	•	Stocker activeDossierId dans un contexte ou l’URL (?dossier=...) ou un zustand store.
	•	Toute section dépendante (Services, Payments) écoute activeDossierId.
	2.	Requêtes cléées par dossier
  const { data: services } = useQuery({
  queryKey: ['dossier','services', activeDossierId],
  queryFn: () => api.getServicesByDossier(activeDossierId),
  enabled: !!activeDossierId,
});
	3.	Reset du state local à la sélection d’un nouveau dossier
  useEffect(() => {
  form.reset(defaultRow);          // vide le form d’ajout
  setLocalRows([]);                // vide les lignes locales non sauvées
}, [activeDossierId]);
4.	Invalidation au moindre changement

	•	Sur ajout/suppression service → invalidateQueries(['dossier','services', activeDossierId]) + ['dossier','summary', activeDossierId].

	5.	API

	•	Vérifier que la route utilisée est bien /dossiers/:id/services (et non /clients/:id/services).
	•	Désactiver tout cache HTTP involontaire (réponse Cache-Control: no-store si nécessaire).

⸻

✅ Critères d’acceptation (tests manuels)
	1.	Compteurs dynamiques

	•	Ajouter un service dans le Dossier A → le badge “X service(s)” de A s’incrémente sans refresh.
	•	Supprimer un service → décrémente immédiatement.
	•	Idem pour les paiements.

	2.	Changement de dossier actif

	•	Sélectionner Dossier A → la section Services liste ceux de A.
	•	Passer à Dossier B → la section Services se met à jour instantanément avec les services de B.
	•	Ajouter 1 service dans B → la liste B se met à jour, puis revenir à A → A affiche ses propres services (pas ceux de B).

	3.	Pas d’état résiduel

	•	Les lignes d’ajout non sauvegardées d’un dossier ne polluent pas l’autre après bascule.

	4.	UI cohérente

	•	L’étiquette “Dossier actif : #ID” correspond à la source des données dans Services/Payments.
	•	Aucun refresh manuel requis pour voir les changements.