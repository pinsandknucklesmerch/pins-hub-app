"use client"

import { useMemo, useState, useSyncExternalStore } from "react"
import { toast } from "sonner"

import BackLink from "@/components/BackLink"
import referenceItems, { type ReferenceItem } from "./referenceData"

const STORAGE_KEY = "pins-hub-reference-saved-messages"
const SAVED_MESSAGES_CATEGORY = "Saved Messages"
const EMPTY_SAVED_MESSAGES: SavedMessage[] = []

type SavedMessage = {
  id: string
  title: string
  body: string
  createdAt: string
  updatedAt: string
}

type EmailContactGroup = {
  category: string
  company: string
  emails: string[]
}

type ReferenceCardItem =
  | ReferenceItem
  | (SavedMessage & {
      category: typeof SAVED_MESSAGES_CATEGORY
      warning?: string
    })

type FormErrors = {
  title?: string
  body?: string
}

const SUPPLIER_LOGISTICS_EMAILS: EmailContactGroup[] = [
  { category: "Posters", company: "Seaward", emails: ["info@seawardcopyshop.com"] },
  { category: "Stickers", company: "Involution", emails: ["nisha@involution.co.uk"] },
  { category: "Pins & Patches", company: "Vast Pins", emails: ["even@vastgifts.com"] },
  { category: "Banners & Flags", company: "Jim", emails: ["jim@custombannerflag.com"] },
  { category: "Logistics", company: "Telenet", emails: ["PWild@telenetlogistics.com"] },
  {
    category: "Logistics",
    company: "HMC",
    emails: ["jon@hmcpacking.com", "angharad@hmcpacking.com"],
  },
  {
    category: "Logistics",
    company: "AAA",
    emails: ["ops@AAAVANS.com", "Chris@AAAVANS.com"],
  },
]

const SUPPLIER_LOGISTICS_EMAILS_COPY = SUPPLIER_LOGISTICS_EMAILS.map((group) =>
  [group.category, group.company, ...group.emails].join("\n"),
).join("\n\n")

let lastSavedMessagesRaw: string | null | undefined
let lastSavedMessagesParsed: SavedMessage[] = EMPTY_SAVED_MESSAGES

function isSavedMessageItem(
  item: ReferenceCardItem,
): item is SavedMessage & { category: typeof SAVED_MESSAGES_CATEGORY; warning?: string } {
  return item.category === SAVED_MESSAGES_CATEGORY
}

function getMessageId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random()}`
}

async function copyText(text: string, label: string) {
  try {
    await navigator.clipboard.writeText(text)
    toast.success(`${label} copied`)
  } catch {
    toast.error(`Failed to copy ${label.toLowerCase()}`)
  }
}

function validateMessage(title: string, body: string): FormErrors {
  const errors: FormErrors = {}

  if (!title.trim()) {
    errors.title = "Title is required."
  }

  if (!body.trim()) {
    errors.body = "Body is required."
  }

  return errors
}

function parseSavedMessages(value: string | null): SavedMessage[] {
  if (!value) {
    return EMPTY_SAVED_MESSAGES
  }

  try {
    const parsed = JSON.parse(value) as unknown

    if (!Array.isArray(parsed)) {
      return EMPTY_SAVED_MESSAGES
    }

    const normalized = parsed
      .filter((message): message is SavedMessage => {
        return Boolean(
          message &&
            typeof message === "object" &&
            typeof message.id === "string" &&
            typeof message.title === "string" &&
            typeof message.body === "string" &&
            typeof message.createdAt === "string" &&
            typeof message.updatedAt === "string",
        )
      })
      .map((message) => ({
        id: message.id,
        title: message.title,
        body: message.body,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
      }))

    return normalized.length ? normalized : EMPTY_SAVED_MESSAGES
  } catch {
    return EMPTY_SAVED_MESSAGES
  }
}

function getSavedMessagesSnapshot() {
  if (typeof window === "undefined") {
    return EMPTY_SAVED_MESSAGES
  }

  const stored = window.localStorage.getItem(STORAGE_KEY)

  if (stored === lastSavedMessagesRaw) {
    return lastSavedMessagesParsed
  }

  const parsed = parseSavedMessages(stored)
  lastSavedMessagesRaw = stored
  lastSavedMessagesParsed = parsed

  return parsed
}

function subscribeToSavedMessages(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => undefined
  }

  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      onStoreChange()
    }
  }

  const handleCustomChange = () => {
    onStoreChange()
  }

  window.addEventListener("storage", handleStorageChange)
  window.addEventListener(`${STORAGE_KEY}-updated`, handleCustomChange)

  return () => {
    window.removeEventListener("storage", handleStorageChange)
    window.removeEventListener(`${STORAGE_KEY}-updated`, handleCustomChange)
  }
}

function updateSavedMessagesStorage(updater: (current: SavedMessage[]) => SavedMessage[]) {
  const nextMessages = updater(getSavedMessagesSnapshot())

  lastSavedMessagesRaw = JSON.stringify(nextMessages)
  lastSavedMessagesParsed = nextMessages.length ? nextMessages : EMPTY_SAVED_MESSAGES

  window.localStorage.setItem(STORAGE_KEY, lastSavedMessagesRaw)
  window.dispatchEvent(new Event(`${STORAGE_KEY}-updated`))
}

function formatSavedMessageForCopy(item: ReferenceCardItem) {
  return [item.body, item.warning ? `WARNING: ${item.warning}` : ""].filter(Boolean).join("\n\n")
}

export default function ReferenceClient() {
  const [query, setQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [newTitle, setNewTitle] = useState("")
  const [newBody, setNewBody] = useState("")
  const [newErrors, setNewErrors] = useState<FormErrors>({})
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editBody, setEditBody] = useState("")
  const [editErrors, setEditErrors] = useState<FormErrors>({})

  const savedMessages = useSyncExternalStore(
    subscribeToSavedMessages,
    getSavedMessagesSnapshot,
    () => EMPTY_SAVED_MESSAGES,
  )

  const savedReferenceItems = useMemo<ReferenceCardItem[]>(
    () =>
      savedMessages.map((message) => ({
        ...message,
        category: SAVED_MESSAGES_CATEGORY,
      })),
    [savedMessages],
  )

  const allItems = useMemo<ReferenceCardItem[]>(
    () => [...savedReferenceItems, ...referenceItems],
    [savedReferenceItems],
  )

  const categories = useMemo(() => {
    const uniqueCategories = new Set<string>(["All"])

    for (const item of allItems) {
      uniqueCategories.add(item.category)
    }

    return Array.from(uniqueCategories)
  }, [allItems])

  const filteredItems = useMemo(() => {
    const search = query.trim().toLowerCase()

    return allItems.filter((item) => {
      const matchesCategory = selectedCategory === "All" || item.category === selectedCategory

      if (!matchesCategory) {
        return false
      }

      if (!search) {
        return true
      }

      return [item.title, item.category, item.body, item.warning ?? ""]
        .join("\n")
        .toLowerCase()
        .includes(search)
    })
  }, [allItems, query, selectedCategory])

  function resetCreateForm() {
    setNewTitle("")
    setNewBody("")
    setNewErrors({})
  }

  function handleCreateMessage() {
    const errors = validateMessage(newTitle, newBody)

    if (errors.title || errors.body) {
      setNewErrors(errors)
      toast.error("Title and body are required.")
      return
    }

    const timestamp = new Date().toISOString()

    updateSavedMessagesStorage((current) => [
      {
        id: getMessageId(),
        title: newTitle.trim(),
        body: newBody.trim(),
        createdAt: timestamp,
        updatedAt: timestamp,
      },
      ...current,
    ])

    resetCreateForm()
    toast.success("Message saved")
  }

  function startEditingMessage(message: SavedMessage) {
    setEditingId(message.id)
    setEditTitle(message.title)
    setEditBody(message.body)
    setEditErrors({})
  }

  function cancelEditingMessage() {
    setEditingId(null)
    setEditTitle("")
    setEditBody("")
    setEditErrors({})
  }

  function handleUpdateMessage(id: string) {
    const errors = validateMessage(editTitle, editBody)

    if (errors.title || errors.body) {
      setEditErrors(errors)
      toast.error("Title and body are required.")
      return
    }

    updateSavedMessagesStorage((current) =>
      current.map((message) =>
        message.id === id
          ? {
              ...message,
              title: editTitle.trim(),
              body: editBody.trim(),
              updatedAt: new Date().toISOString(),
            }
          : message,
      ),
    )

    cancelEditingMessage()
    toast.success("Message updated")
  }

  function handleDeleteMessage(id: string) {
    updateSavedMessagesStorage((current) => current.filter((message) => message.id !== id))

    if (editingId === id) {
      cancelEditingMessage()
    }

    toast.success("Message deleted")
  }

  function renderSavedMessageCard(message: SavedMessage, keyPrefix: string) {
    const isEditing = editingId === message.id

    if (isEditing) {
      return (
        <div key={`${keyPrefix}-${message.id}`} className="rounded-2xl border border-brand-border bg-brand-panel/88 p-5">
          <h3 className="text-lg font-semibold text-brand-cream">Edit saved message</h3>
          <div className="mt-4 grid gap-4">
            <div className="grid gap-2">
              <label htmlFor={`edit-title-${keyPrefix}-${message.id}`} className="text-sm font-medium text-brand-cream">
                Title
              </label>
              <input
                id={`edit-title-${keyPrefix}-${message.id}`}
                value={editTitle}
                onChange={(event) => {
                  setEditTitle(event.target.value)
                  if (editErrors.title) {
                    setEditErrors((current) => ({ ...current, title: undefined }))
                  }
                }}
                className="hub-input rounded-2xl px-4 py-3 text-sm outline-none"
              />
              {editErrors.title ? <p className="text-xs text-brand-red/90">{editErrors.title}</p> : null}
            </div>

            <div className="grid gap-2">
              <label htmlFor={`edit-body-${keyPrefix}-${message.id}`} className="text-sm font-medium text-brand-cream">
                Message
              </label>
              <textarea
                id={`edit-body-${keyPrefix}-${message.id}`}
                value={editBody}
                onChange={(event) => {
                  setEditBody(event.target.value)
                  if (editErrors.body) {
                    setEditErrors((current) => ({ ...current, body: undefined }))
                  }
                }}
                rows={6}
                className="hub-input rounded-2xl px-4 py-3 text-sm leading-6 outline-none"
              />
              {editErrors.body ? <p className="text-xs text-brand-red/90">{editErrors.body}</p> : null}
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => handleUpdateMessage(message.id)}
                className="hub-button-primary rounded-full px-4 py-2 text-sm font-semibold"
              >
                Save
              </button>
              <button
                type="button"
                onClick={cancelEditingMessage}
                className="hub-button-secondary rounded-full px-4 py-2 text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )
    }

    return (
      <details
        key={`${keyPrefix}-${message.id}`}
        className="rounded-2xl border border-brand-border bg-brand-panel/88 p-5 shadow-[var(--shadow-soft)]"
      >
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-brand-red">
              {SAVED_MESSAGES_CATEGORY}
            </p>
            <h3 className="mt-2 text-lg font-semibold text-brand-cream">{message.title}</h3>
            <p className="mt-2 text-xs text-brand-muted">Saved locally on this browser/device.</p>
          </div>
          <span className="rounded-full border border-brand-border/80 px-3 py-1 text-xs font-medium text-brand-muted">
            Expand
          </span>
        </summary>

        <div className="mt-4 space-y-4">
          <div className="whitespace-pre-wrap rounded-2xl border border-brand-border/70 bg-brand-panel-alt/70 px-4 py-4 text-sm leading-6 text-brand-cream">
            {message.body}
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => copyText(message.body, "Message")}
              className="hub-button-primary rounded-full px-4 py-2 text-sm font-semibold"
            >
              Copy
            </button>
            <button
              type="button"
              onClick={() => startEditingMessage(message)}
              className="hub-button-secondary rounded-full px-4 py-2 text-sm font-medium"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => handleDeleteMessage(message.id)}
              className="hub-button-secondary rounded-full px-4 py-2 text-sm font-medium"
            >
              Delete
            </button>
          </div>
        </div>
      </details>
    )
  }

  return (
    <main className="hub-page-stack">
      <BackLink href="/">Back to Hub</BackLink>

      <section className="hub-panel rounded-[2rem] p-5 md:p-6">
        <h1 className="hub-page-header-title">
          Copy, addresses, and saved messages
        </h1>

        <div className="mt-3 grid gap-3 rounded-2xl border border-brand-border/70 bg-brand-panel-alt/40 p-4">
          <div className="grid gap-2">
            <label htmlFor="reference-search" className="text-sm font-medium text-brand-cream">
              Search
            </label>
            <input
              id="reference-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search titles, copy, categories, warnings..."
              className="hub-input rounded-2xl px-4 py-3 text-sm outline-none"
            />
          </div>

          <div>
            <span className="text-sm font-medium text-brand-cream">Category</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {categories.map((category) => {
                const isActive = selectedCategory === category

                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                      isActive
                        ? "border-brand-red bg-brand-red/16 text-brand-cream"
                        : "border-brand-border/80 text-brand-cream/90 hover:border-brand-red/40 hover:text-brand-cream"
                    }`}
                  >
                    {category}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="text-sm text-brand-muted/80">
            Showing {filteredItems.length} result{filteredItems.length === 1 ? "" : "s"}.
          </div>
        </div>
      </section>

      <details className="rounded-3xl border border-brand-border bg-brand-panel/88 p-5 shadow-2xl shadow-black/20">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-brand-cream">Custom Message</h2>
            <p className="mt-1 text-sm text-brand-muted">
              Saved messages are stored locally in this browser for quick reuse.
            </p>
          </div>
          <span className="rounded-full border border-brand-border/80 px-3 py-1 text-xs font-medium text-brand-muted">
            {savedMessages.length} saved
          </span>
        </summary>

        <div className="mt-4 grid gap-4">
          <div className="grid gap-3 rounded-2xl border border-brand-border/70 bg-brand-panel-alt/60 p-4">
            <div className="grid gap-2">
              <label htmlFor="saved-message-title" className="text-sm font-medium text-brand-cream">
                Title
              </label>
              <input
                id="saved-message-title"
                value={newTitle}
                onChange={(event) => {
                  setNewTitle(event.target.value)
                  if (newErrors.title) {
                    setNewErrors((current) => ({ ...current, title: undefined }))
                  }
                }}
                placeholder="Example: Freight follow-up"
                className="hub-input rounded-2xl px-4 py-3 text-sm outline-none"
              />
              {newErrors.title ? <p className="text-xs text-brand-red/90">{newErrors.title}</p> : null}
            </div>

            <div className="grid gap-2">
              <label htmlFor="saved-message-body" className="text-sm font-medium text-brand-cream">
                Message
              </label>
              <textarea
                id="saved-message-body"
                value={newBody}
                onChange={(event) => {
                  setNewBody(event.target.value)
                  if (newErrors.body) {
                    setNewErrors((current) => ({ ...current, body: undefined }))
                  }
                }}
                rows={6}
                placeholder="Write the message body here..."
                className="hub-input rounded-2xl px-4 py-3 text-sm leading-6 outline-none"
              />
              {newErrors.body ? <p className="text-xs text-brand-red/90">{newErrors.body}</p> : null}
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleCreateMessage}
                className="hub-button-primary rounded-full px-4 py-2 text-sm font-semibold"
              >
                Save
              </button>
              <button
                type="button"
                onClick={resetCreateForm}
                className="hub-button-secondary rounded-full px-4 py-2 text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>

          <div className="grid gap-3">
            {savedMessages.length ? (
              savedMessages.map((message) => renderSavedMessageCard(message, "custom-section"))
            ) : (
              <div className="rounded-2xl border border-dashed border-brand-border/80 bg-brand-panel-alt/40 px-4 py-5 text-sm text-brand-muted">
                No saved messages yet. Add one above to reuse it later.
              </div>
            )}
          </div>
        </div>
      </details>

      <details className="rounded-3xl border border-brand-border bg-brand-panel/88 p-5 shadow-2xl shadow-black/20">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-brand-cream">Supplier & Logistics Emails</h2>
            <p className="mt-1 text-sm text-brand-muted">
              Copy supplier and logistics emails without leaving the reference page.
            </p>
          </div>
          <span className="rounded-full border border-brand-border/80 px-3 py-1 text-xs font-medium text-brand-muted">
            {SUPPLIER_LOGISTICS_EMAILS.reduce((count, group) => count + group.emails.length, 0)} emails
          </span>
        </summary>

        <div className="mt-4 space-y-3">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => copyText(SUPPLIER_LOGISTICS_EMAILS_COPY, "All emails")}
              className="hub-button-primary rounded-full px-4 py-2 text-sm font-semibold"
            >
              Copy All Emails
            </button>
          </div>

          <div className="grid gap-2.5">
            {SUPPLIER_LOGISTICS_EMAILS.map((group) =>
              group.emails.map((email) => (
                <div
                  key={`${group.company}-${email}`}
                  className="grid gap-3 rounded-2xl border border-brand-border/70 bg-brand-panel-alt/60 p-4 md:grid-cols-[1.2fr_1fr_1.6fr_auto] md:items-center"
                >
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-brand-red">
                      Category
                    </p>
                    <p className="mt-1 text-sm font-medium text-brand-cream">{group.category}</p>
                  </div>

                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-brand-red">
                      Company
                    </p>
                    <p className="mt-1 text-sm font-medium text-brand-cream">{group.company}</p>
                  </div>

                  <div className="min-w-0">
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-brand-red">
                      Contact Email
                    </p>
                    <a
                      href={`mailto:${email}`}
                      className="mt-1 block truncate text-sm text-brand-cream underline decoration-brand-border underline-offset-4"
                    >
                      {email}
                    </a>
                  </div>

                  <div className="md:justify-self-end">
                    <button
                      type="button"
                      onClick={() => copyText(email, "Email")}
                      className="hub-button-secondary rounded-full px-4 py-2 text-sm font-medium"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              )),
            )}
          </div>
        </div>
      </details>

      <section className="grid gap-3">
        {filteredItems.length ? (
          filteredItems.map((item) => {
            if (isSavedMessageItem(item)) {
              return renderSavedMessageCard(item, "search-results")
            }

            return (
              <details
                key={item.id}
                className="rounded-2xl border border-brand-border bg-brand-panel/88 p-5 shadow-[var(--shadow-soft)]"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-brand-red">
                      {item.category}
                    </p>
                    <h2 className="mt-2 text-lg font-semibold text-brand-cream">{item.title}</h2>
                  </div>
                  <span className="rounded-full border border-brand-border/80 px-3 py-1 text-xs font-medium text-brand-muted">
                    Expand
                  </span>
                </summary>

                <div className="mt-4 space-y-4">
                  {item.warning ? (
                    <div className="hub-accent-panel rounded-2xl px-4 py-3 text-sm font-medium text-brand-cream">
                      {item.warning}
                    </div>
                  ) : null}

                  <div className="whitespace-pre-wrap rounded-2xl border border-brand-border/70 bg-brand-panel-alt/70 px-4 py-4 text-sm leading-6 text-brand-cream">
                    {item.body}
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => copyText(formatSavedMessageForCopy(item), "Reference")}
                      className="hub-button-primary rounded-full px-4 py-2 text-sm font-semibold"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </details>
            )
          })
        ) : (
          <div className="rounded-2xl border border-dashed border-brand-border/80 bg-brand-panel-alt/40 px-4 py-6 text-sm text-brand-muted">
            No reference items match your current search.
          </div>
        )}
      </section>
    </main>
  )
}
