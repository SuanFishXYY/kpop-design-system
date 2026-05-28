# v3.3.0 Mixed Council Protocol

Mixed Council adds three equal member types: idol specialists (`agents/`), group representatives (`groups/`), and the user seat. Every member has one vote.

## Assembly

- DRI: group match -> group DRI; style/idol match -> idol DRI; agency match -> brand DRI; fallback -> stage-director.
- Invitation expansion: breadth-first, 3 layers, max 3 single-round invites.
- Council cap: 5 members by default; 7 when the brief spans generations or agencies.
- Mix requirement: councils with 4+ members must include at least 2 idols and 2 groups.
- Same-agency hard cap: no more than 3 groups from one agency.

## Sister group relations

1. `same_generation`: derived from group `era`.
2. `same_agency`: derived from group `agency`.
3. `same_aesthetic`: derived from overlapping `aesthetic_tags`.
4. `aesthetic_counterpoint`: elegant rival relation from `rivals` + `counterpoint_axis`.

## Voice templates

Top groups can provide `voice.identity`, `voice.position_statement`, hard `voice.veto_triggers`, and `voice.question_template`. LLM voice stays soft; veto triggers are deterministic.

## Deliberation

- R1 independent statements: <=200 tokens/member.
- R2 cross-examination: <=300 tokens/member.
- R3 merged declaration: <=150 tokens/member.
- No R4. Total cap: 4550 estimated tokens.

## Verdict

- Consensus: >=2/3 agree.
- Compromise: >1/2 accept.
- Dissent: retained for user judgment.
- Voting: each member one vote + user one vote; PASS requires strict `> 2/3` excluding abstain from denominator.
- Chair abstain is invalid.
- User veto/override remains explicit and audited.
