import { useEffect } from 'react'
import { useForm, useWatch, type FieldError } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useBlocker } from '@tanstack/react-router'
import {
  CITIES,
  dealFormSchema,
  RENTAL_TYPE_LABELS,
  RENTAL_TYPES,
  STAGE_LABELS,
  STAGES,
  type Deal,
  type DealFormInput,
  type DealFormValues,
} from '../../domain/deal'
import { Button } from '../../ui/Button'
import { controlClassName, Field } from '../../ui/Field'
import { LeaveDialog } from './LeaveDialog'
import { useUpdateDeal } from './queries'
import styles from './DealForm.module.css'

function toFormInput(deal: Deal): DealFormInput {
  const { id, createdAt, updatedAt, closedAt, ...values } = deal
  return values
}

export function DealForm({ deal }: { deal: Deal }) {
  const mutation = useUpdateDeal(deal.id)
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isDirty, isSubmitting, isSubmitSuccessful },
  } = useForm<DealFormInput, unknown, DealFormValues>({
    resolver: zodResolver(dealFormSchema),
    defaultValues: toFormInput(deal),
    shouldUnregister: true,
    mode: 'onTouched',
  })

  const rentalType = useWatch({ control, name: 'rentalType' })
  const fieldErrors = errors as Partial<Record<string, FieldError>>
  const errorOf = (name: string) => fieldErrors[name]?.message

  const savedDeal = mutation.data
  useEffect(() => {
    if (isSubmitSuccessful && savedDeal) {
      reset(toFormInput(savedDeal), { keepIsSubmitSuccessful: true })
    }
  }, [isSubmitSuccessful, savedDeal, reset])

  // The deal can change outside this form (for example, a demo data reset).
  // Take the new values only when there are no unsaved edits to lose.
  useEffect(() => {
    if (!isDirty) reset(toFormInput(deal), { keepIsSubmitSuccessful: true })
  }, [deal, isDirty, reset])

  const blocker = useBlocker({
    shouldBlockFn: () => isDirty,
    enableBeforeUnload: () => isDirty,
    withResolver: true,
  })

  const save = async (values: DealFormValues) => {
    await mutation.mutateAsync(values)
  }

  return (
    <>
      <form
        className={styles.form}
        noValidate
        aria-label="Edit deal"
        onSubmit={(event) => void handleSubmit(save)(event).catch(() => undefined)}
      >
        {mutation.isError && (
          <div className={styles.saveError} role="alert">
            Could not save the deal. {mutation.error.message} Your changes are still here; try again.
          </div>
        )}

        <fieldset className={styles.section}>
          <legend>Client</legend>
          <Field label="Client name" error={errorOf('clientName')}>
            {(props) => <input {...props} className={controlClassName} autoComplete="off" {...register('clientName')} />}
          </Field>
          <Field label="Client email" error={errorOf('clientEmail')}>
            {(props) => (
              <input {...props} type="email" className={controlClassName} autoComplete="off" {...register('clientEmail')} />
            )}
          </Field>
        </fieldset>

        <fieldset className={styles.section}>
          <legend>Property</legend>
          <Field label="Address" error={errorOf('address')}>
            {(props) => <input {...props} className={controlClassName} autoComplete="off" {...register('address')} />}
          </Field>
          <Field label="City" error={errorOf('city')}>
            {(props) => (
              <select {...props} className={controlClassName} {...register('city')}>
                {CITIES.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            )}
          </Field>
        </fieldset>

        <fieldset className={styles.section}>
          <legend>Deal</legend>
          <Field label="Stage" error={errorOf('stage')}>
            {(props) => (
              <select {...props} className={controlClassName} {...register('stage')}>
                {STAGES.map((stage) => (
                  <option key={stage} value={stage}>
                    {STAGE_LABELS[stage]}
                  </option>
                ))}
              </select>
            )}
          </Field>
          <div className={styles.radioGroup} role="radiogroup" aria-label="Rental type">
            {RENTAL_TYPES.map((type) => (
              <label key={type} className={styles.radio}>
                <input type="radio" value={type} {...register('rentalType')} />
                {RENTAL_TYPE_LABELS[type]}
              </label>
            ))}
          </div>
        </fieldset>

        {rentalType === 'long' ? (
          <fieldset className={styles.section} key="long">
            <legend>Long-term rental</legend>
            <Field label="Monthly rent" hint="EUR per month" error={errorOf('monthlyRent')}>
              {(props) => (
                <input
                  {...props}
                  type="number"
                  inputMode="numeric"
                  min={0}
                  className={controlClassName}
                  {...register('monthlyRent', { valueAsNumber: true })}
                />
              )}
            </Field>
            <Field label="Deposit" hint="EUR" error={errorOf('deposit')}>
              {(props) => (
                <input
                  {...props}
                  type="number"
                  inputMode="numeric"
                  min={0}
                  className={controlClassName}
                  {...register('deposit', { valueAsNumber: true })}
                />
              )}
            </Field>
            <Field label="Contract length" hint="Months" error={errorOf('contractMonths')}>
              {(props) => (
                <input
                  {...props}
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={60}
                  className={controlClassName}
                  {...register('contractMonths', { valueAsNumber: true })}
                />
              )}
            </Field>
            <Field label="Move-in date" error={errorOf('moveInDate')}>
              {(props) => <input {...props} type="date" className={controlClassName} {...register('moveInDate')} />}
            </Field>
          </fieldset>
        ) : (
          <fieldset className={styles.section} key="short">
            <legend>Short-term rental</legend>
            <Field label="Nightly rate" hint="EUR per night" error={errorOf('nightlyRate')}>
              {(props) => (
                <input
                  {...props}
                  type="number"
                  inputMode="numeric"
                  min={0}
                  className={controlClassName}
                  {...register('nightlyRate', { valueAsNumber: true })}
                />
              )}
            </Field>
            <Field label="Guests" error={errorOf('guests')}>
              {(props) => (
                <input
                  {...props}
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={12}
                  className={controlClassName}
                  {...register('guests', { valueAsNumber: true })}
                />
              )}
            </Field>
            <Field label="Check-in" error={errorOf('checkIn')}>
              {(props) => <input {...props} type="date" className={controlClassName} {...register('checkIn')} />}
            </Field>
            <Field label="Check-out" error={errorOf('checkOut')}>
              {(props) => <input {...props} type="date" className={controlClassName} {...register('checkOut')} />}
            </Field>
          </fieldset>
        )}

        <div className={styles.footer}>
          <p role="status" className={styles.saved}>
            {isSubmitSuccessful && !isDirty ? 'Changes saved' : ''}
          </p>
          <Button variant="secondary" disabled={!isDirty || isSubmitting} onClick={() => reset()}>
            Discard changes
          </Button>
          <Button type="submit" variant="primary" disabled={!isDirty || isSubmitting}>
            {isSubmitting ? 'Saving…' : 'Save changes'}
          </Button>
        </div>
      </form>

      <LeaveDialog
        open={blocker.status === 'blocked'}
        onStay={() => blocker.reset?.()}
        onLeave={() => blocker.proceed?.()}
      />
    </>
  )
}
