from erpnext.accounts.doctype.journal_entry.journal_entry import JournalEntry as OriginalJournalEntry

class CustomJournalEntry(OriginalJournalEntry):
	def check_credit_limit(self):
		pass