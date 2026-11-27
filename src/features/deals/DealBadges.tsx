import { Badge } from '../../ui/Badge'
import { RENTAL_TYPE_LABELS, STAGE_LABELS, type RentalType, type Stage } from '../../domain/deal'

const STAGE_TONES = {
  inquiry: 'neutral',
  viewing: 'neutral',
  contract: 'accent',
  won: 'success',
  lost: 'danger',
} as const satisfies Record<Stage, string>

export function StageBadge({ stage, testId }: { stage: Stage; testId?: string }) {
  return (
    <Badge tone={STAGE_TONES[stage]} testId={testId}>
      {STAGE_LABELS[stage]}
    </Badge>
  )
}

export function RentalTypeBadge({ type, testId }: { type: RentalType; testId?: string }) {
  return (
    <Badge tone={type === 'long' ? 'accent' : 'warm'} testId={testId}>
      {RENTAL_TYPE_LABELS[type]}
    </Badge>
  )
}
