import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { useDebounce } from "@/hooks/use-debounce";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  MoreHorizontal,
  ArrowUpDown,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import type { Client } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ClientPreviewPanel } from "@/components/clients/ClientPreviewPanel";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AddEditClientForm } from "@/components/clients/AddEditClientForm";
import { insertClientSchema } from "@shared/schema";
import { z } from "zod";

interface PaginatedClientsResponse {
  clients: Client[];
  totalCount: number;
}

export default function EnhancedClients() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [sorting, setSorting] = useState<SortingState>([
    { id: "name", desc: false },
  ]);
  const [rowSelection, setRowSelection] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [previewClientId, setPreviewClientId] = useState<number | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", (pagination.pageIndex + 1).toString());
    params.set("limit", pagination.pageSize.toString());
    params.set("sortBy", sorting[0]?.id ?? "name");
    params.set("sortOrder", sorting[0]?.desc ? "desc" : "asc");
    if (debouncedSearchTerm) {
      params.set("search", debouncedSearchTerm);
    }
    return params;
  }, [pagination, sorting, debouncedSearchTerm]);

  const {
    data,
    isLoading,
    isError,
  } = useQuery<PaginatedClientsResponse>({
    queryKey: ["/api/clients", queryParams.toString()],
    queryFn: async () => {
        const response = await apiRequest("GET", `/api/clients?${queryParams.toString()}`);
        return response.json();
    },
    keepPreviousData: true,
  });

  const createClientMutation = useMutation({
    mutationFn: (newClient: Omit<z.infer<typeof insertClientSchema>, 'userId' | 'assignedTeamMembers' | 'kpis'>) => 
      apiRequest("POST", "/api/clients", { ...newClient, userId: "1" }), // Assuming userId is static for now
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      toast({ title: "Client created successfully" });
      setIsFormOpen(false);
      setEditingClient(null);
    },
    onError: (error: Error) => {
        toast({
            title: "Error creating client",
            description: error.message,
            variant: "destructive"
        })
    }
  });

  const updateClientMutation = useMutation({
    mutationFn: ({ id, ...updatedClient }: { id: number } & Partial<Client>) => 
      apiRequest("PUT", `/api/clients/${id}`, updatedClient),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      toast({ title: "Client updated successfully" });
      setIsFormOpen(false);
      setEditingClient(null);
    },
    onError: (error: Error) => {
        toast({
            title: "Error updating client",
            description: error.message,
            variant: "destructive"
        })
    }
  });

  const deleteClientMutation = useMutation({
    mutationFn: (clientId: number) => apiRequest("DELETE", `/api/clients/${clientId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      toast({
        title: "Client deleted",
        description: "Client has been successfully removed.",
      });
    },
    onError: () => {
      toast({
          title: "Error",
          description: "Failed to delete client.",
          variant: "destructive"
      })
    }
  });

  const handleFormSubmit = (data: Omit<z.infer<typeof insertClientSchema>, 'userId' | 'assignedTeamMembers' | 'kpis'>) => {
    if (editingClient) {
      updateClientMutation.mutate({ id: editingClient.id, ...data });
    } else {
      createClientMutation.mutate(data);
    }
  };
  
  const columns: ColumnDef<Client>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: "company",
      header: "Company",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "phone",
      header: "Phone",
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const client = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setPreviewClientId(client.id)}>
                <Eye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setEditingClient(client); setIsFormOpen(true); }}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-500"
                onClick={() => deleteClientMutation.mutate(client.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: data?.clients ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    pageCount: data?.totalCount ? Math.ceil(data.totalCount / pagination.pageSize) : 0,
    onPaginationChange: setPagination,
    manualPagination: true,
    manualSorting: true,
    state: {
      sorting,
      rowSelection,
      pagination,
    },
  });

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Clients</h1>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by name, company, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
        </div>
        <Button onClick={() => { setEditingClient(null); setIsFormOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Add Client
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
                <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                        <LoadingSpinner />
                    </TableCell>
                </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>

      {previewClientId && (
        <ClientPreviewPanel
          clientId={previewClientId}
          onClose={() => setPreviewClientId(null)}
        />
      )}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{editingClient ? "Edit Client" : "Add New Client"}</DialogTitle>
                <DialogDescription>
                    {editingClient ? "Update the details for this client." : "Fill in the details to create a new client."}
                </DialogDescription>
            </DialogHeader>
            <AddEditClientForm 
                client={editingClient} 
                onSubmit={handleFormSubmit}
                isSubmitting={createClientMutation.isPending || updateClientMutation.isPending}
            />
        </DialogContent>
      </Dialog>
    </div>
  );
}