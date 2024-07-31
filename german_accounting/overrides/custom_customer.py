import frappe

def _do_nothing(*_args, **_kwargs) -> None:  # type: ignore  # noqa: ANN002, ANN003
    frappe.msgprint("Overrided by Monkey Patch in IMAT")