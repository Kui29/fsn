"use client";
import {useCallback, useEffect, useState} from "react";
import {onAuthStateChanged, signInWithPopup, signOut, User} from "firebase/auth";
import {getDownloadURL, ref, uploadBytes} from "firebase/storage";
import {
	Autocomplete, AutocompleteItem, Button, Checkbox, Input, Tab, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Tabs, Textarea,
} from "@nextui-org/react";
import {auth, provider, storage} from "@/firebase/fbConfigSetter";
import {title} from "@/components/primitives";
import {MediaView} from "@/components/MediaView";
import {AdminField, AdminResource, adminResources, fieldLabel} from "@/config/adminResources";
import "./admin.css";

type Row = Record<string, any>;
// Records of each linked data set, keyed by data set name
type Linked = Record<string, Row[]>;

async function adminFetch(user: User, path: string, init: RequestInit = {}) {
	const response = await fetch(`/api/admin/${path}`, {
		...init,
		headers: {"Content-Type": "application/json", Authorization: `Bearer ${await user.getIdToken()}`},
	});
	if (!response.ok) throw new Error((await response.json()).error ?? "Request failed");
	return response;
}

function toFormValue(field: AdminField, value: any) {
	if (field.type === "boolean") return Boolean(value);
	if (field.type === "password" || value === undefined || value === null) return "";
	if (field.type === "date") return String(value).slice(0, 10);
	if (field.type === "list") return Array.isArray(value) ? value.join(", ") : value;
	return value;
}

// Shows a linked record by its name instead of its ID
function linkedName(field: AdminField, linked: Linked, id: any) {
	const target = adminResources[field.references!];
	const match = linked[field.references!]?.find(row => row[target.idField] === id);
	return match?.[target.nameField] || id;
}

// Fills in a linked field on a new record: the signed-in admin for user links,
// or the only choice when the linked data set has just one record
function defaultLink(field: AdminField, linked: Linked, adminEmail: string | null) {
	const target = adminResources[field.references!];
	const rows = linked[field.references!] ?? [];
	const match = field.references === "users"
		? rows.find(row => row.email?.toLowerCase() === adminEmail?.toLowerCase())
		: rows.length === 1 ? rows[0] : undefined;
	return match?.[target.idField] ?? "";
}

function formatCell(field: AdminField | undefined, value: any, linked: Linked) {
	if (field?.type === "reference" && value) return linkedName(field, linked, value);
	if (field?.type === "media") return <MediaView url={value} alt={fieldLabel(field)} className="h-12 w-auto"/>;
	if (typeof value === "boolean") return value ? "Yes" : "No";
	const text = typeof value === "object" && value !== null ? JSON.stringify(value) : String(value ?? "");
	return text.length > 60 ? `${text.slice(0, 60)}…` : text;
}

export default function AdminPage() {
	const [user, setUser] = useState<User | null>(null);
	const [authReady, setAuthReady] = useState(false);

	useEffect(() => onAuthStateChanged(auth, current => {
		setUser(current);
		setAuthReady(true);
	}), []);

	return (
		<div className="flex flex-col gap-4 w-full py-6">
			<h1 className={title()}>Admin</h1>
			<div className="admin-panel bg-content1 text-foreground rounded-xl shadow-md p-6 flex flex-col gap-4">
				{!authReady ? <p>Loading…</p> : user ? (
					<>
						<p>Signed in as {user.email} <Button size="sm" variant="light" onPress={() => signOut(auth)}>Sign out</Button></p>
						<AdminDashboard user={user}/>
					</>
				) : (
					<Button className="self-start" color="primary" onPress={() => signInWithPopup(auth, provider)}>
						Sign in with Google
					</Button>
				)}
			</div>
		</div>
	);
}

function AdminDashboard({user}: {user: User}) {
	const [resourceKey, setResourceKey] = useState(Object.keys(adminResources)[0]);
	const [rows, setRows] = useState<Row[]>([]);
	const [linked, setLinked] = useState<Linked>({});
	const [error, setError] = useState("");
	// undefined: form closed, null: adding a new record, string: editing that record
	const [editingId, setEditingId] = useState<string | null | undefined>(undefined);
	const resource = adminResources[resourceKey];

	const load = useCallback(async () => {
		setError("");
		setEditingId(undefined);
		try {
			const linkedKeys = Array.from(new Set(adminResources[resourceKey].fields.flatMap(f => f.references ?? [])));
			const [records, ...linkedRows] = await Promise.all([resourceKey, ...linkedKeys].map(async key =>
				(await adminFetch(user, key)).json()));
			setRows(records);
			setLinked(Object.fromEntries(linkedKeys.map((key, i) => [key, linkedRows[i]])));
		} catch (e: any) {
			setError(e.message);
			setRows([]);
		}
	}, [user, resourceKey]);

	useEffect(() => {
		load();
	}, [load]);

	const exportCsv = async () => {
		try {
			const blob = await (await adminFetch(user, `${resourceKey}?format=csv`)).blob();
			const link = document.createElement("a");
			link.href = URL.createObjectURL(blob);
			link.download = `${resourceKey}.csv`;
			link.click();
			URL.revokeObjectURL(link.href);
		} catch (e: any) {
			setError(e.message);
		}
	};

	const save = async (values: Row) => {
		try {
			const path = editingId ? `${resourceKey}/${encodeURIComponent(editingId)}` : resourceKey;
			await adminFetch(user, path, {method: editingId ? "PATCH" : "POST", body: JSON.stringify(values)});
			await load();
		} catch (e: any) {
			setError(e.message);
		}
	};

	const columns = [
		{key: resource.idField, label: "ID", field: undefined},
		...resource.fields.filter(f => f.type !== "password").map(f => ({key: f.name, label: fieldLabel(f), field: f})),
	];

	return (
		<div className="flex flex-col gap-4">
			<Tabs color="primary" classNames={{tabContent: "text-default-700"}} selectedKey={resourceKey} onSelectionChange={key => setResourceKey(String(key))}>
				{Object.entries(adminResources).map(([key, r]) => <Tab key={key} title={r.label}/>)}
			</Tabs>
			<div className="flex gap-2">
				<Button color="primary" onPress={() => setEditingId(null)}>Add {resource.label.toLowerCase()}</Button>
				<Button variant="bordered" onPress={exportCsv}>Download CSV</Button>
				<Button variant="light" onPress={load}>Refresh</Button>
			</div>
			{error && <p className="text-danger-600">{error}</p>}
			{editingId !== undefined && (
				<RecordForm
					key={`${resourceKey}-${editingId}`}
					resource={resource}
					record={rows.find(row => row[resource.idField] === editingId)}
					linked={linked}
					adminEmail={user.email}
					onSave={save}
					onCancel={() => setEditingId(undefined)}
				/>
			)}
			<Table aria-label={resource.label} isStriped>
				<TableHeader>
					{[...columns.map(col => <TableColumn key={col.key}>{col.label}</TableColumn>), <TableColumn key="actions"> </TableColumn>]}
				</TableHeader>
				<TableBody emptyContent="No records yet">
					{rows.map(row => (
						<TableRow key={row[resource.idField]}>
							{[...columns.map(col => <TableCell key={col.key}>{formatCell(col.field, row[col.key], linked)}</TableCell>),
								<TableCell key="actions">
									<Button size="sm" onPress={() => setEditingId(row[resource.idField])}>Edit</Button>
								</TableCell>]}
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}

type RecordFormProps = {
	resource: AdminResource;
	record?: Row;
	linked: Linked;
	adminEmail: string | null;
	onSave: (values: Row) => Promise<void>;
	onCancel: () => void;
};

function RecordForm({resource, record, linked, adminEmail, onSave, onCancel}: RecordFormProps) {
	const [values, setValues] = useState<Row>(() => ({
		// New records get their ID here; existing records keep theirs
		[resource.idField]: record?.[resource.idField] ?? crypto.randomUUID(),
		...Object.fromEntries(resource.fields.map(f => [f.name,
			!record && f.type === "reference" ? defaultLink(f, linked, adminEmail) : toFormValue(f, record?.[f.name])])),
	}));
	const [saving, setSaving] = useState(false);
	const setValue = (name: string, value: any) => setValues(prev => ({...prev, [name]: value}));

	const submit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSaving(true);
		await onSave(values);
		setSaving(false);
	};

	return (
		<form onSubmit={submit} className="flex flex-col gap-3 max-w-xl">
			<Input label="ID" value={values[resource.idField]} isReadOnly description="Created automatically"/>
			{resource.fields.map(field => {
				const props = {
					label: fieldLabel(field),
					value: values[field.name],
					onValueChange: (value: string) => setValue(field.name, value),
					// Leaving the password blank when editing keeps the current one
					isRequired: field.required && !(record && field.type === "password"),
				};
				switch (field.type) {
					case "boolean":
						return (
							<Checkbox key={field.name} size="lg" isSelected={values[field.name]}
									  onValueChange={value => setValue(field.name, value)}>
								{fieldLabel(field)}
							</Checkbox>
						);
					case "reference":
					return <ReferenceField key={field.name} {...props} field={field} linked={linked}/>;
				case "media":
						return (
							<MediaField key={field.name} {...props} folder={resource.collection}/>
						);
					case "longtext":
						return <Textarea key={field.name} {...props}/>;
					case "list":
						return <Input key={field.name} {...props} description="Separate items with commas"/>;
					default:
						return <Input key={field.name} {...props} type={field.type === "text" ? "text" : field.type}/>;
				}
			})}
			<div className="flex gap-2">
				<Button type="submit" color="primary" isLoading={saving}>Save</Button>
				<Button variant="light" onPress={onCancel}>Cancel</Button>
			</div>
		</form>
	);
}

type MediaFieldProps = {
	label: string;
	value: string;
	folder: string;
	isRequired?: boolean;
	onValueChange: (value: string) => void;
};

// Uploads a photo or video to Firebase Storage and keeps its link in the form
function MediaField({label, value, folder, isRequired, onValueChange}: MediaFieldProps) {
	const [status, setStatus] = useState("");

	const upload = async (file?: File) => {
		if (!file) return;
		setStatus("Uploading…");
		try {
			const fileRef = ref(storage, `admin/${folder}/${Date.now()}-${file.name}`);
			await uploadBytes(fileRef, file);
			onValueChange(await getDownloadURL(fileRef));
			setStatus("");
		} catch {
			setStatus("Upload failed, please try again");
		}
	};

	return (
		<div className="flex flex-col gap-2">
			<Input label={label} value={value} onValueChange={onValueChange} isRequired={isRequired}
				   description="Upload a photo or video below, or paste a link"/>
			<MediaView url={value} alt={label} className="max-h-48 w-auto rounded-lg"/>
			<input type="file" accept="image/*,video/*" aria-label={`Upload ${label}`}
				   onChange={e => upload(e.target.files?.[0])}/>
			{status && <p>{status}</p>}
		</div>
	);
}

type ReferenceFieldProps = {
	label: string;
	value: string;
	field: AdminField;
	linked: Linked;
	isRequired?: boolean;
	onValueChange: (value: string) => void;
};

// Lets the admin pick a linked record by name; its ID is what gets saved
function ReferenceField({label, value, field, linked, isRequired, onValueChange}: ReferenceFieldProps) {
	const target = adminResources[field.references!];
	return (
		<Autocomplete label={label} isRequired={isRequired} selectedKey={value || null}
					  defaultItems={linked[field.references!] ?? []}
					  onSelectionChange={key => onValueChange(key ? String(key) : "")}>
			{row => (
				<AutocompleteItem key={row[target.idField]} textValue={String(row[target.nameField] || row[target.idField])}>
					{row[target.nameField] || row[target.idField]}
				</AutocompleteItem>
			)}
		</Autocomplete>
	);
}
