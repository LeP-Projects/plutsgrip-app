import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/Card"
import { Button } from "@/components/Button"
import { Input } from "@/components/Input"
import { Label } from "@/components/Label"
import { Badge } from "@/components/Badge"
import { PlusCircle, Trash2, Edit } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/Dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/AlertDialog"

interface Category {
  id: string
  name: string
  expenseCount: number
  totalAmount: number
}

const mockCategories: Category[] = [
  { id: "1", name: "Food & Dining", expenseCount: 15, totalAmount: 450.0 },
  { id: "2", name: "Transportation", expenseCount: 8, totalAmount: 320.0 },
  { id: "3", name: "Shopping", expenseCount: 12, totalAmount: 280.0 },
  { id: "4", name: "Bills & Utilities", expenseCount: 4, totalAmount: 184.0 },
  { id: "5", name: "Entertainment", expenseCount: 6, totalAmount: 120.0 },
  { id: "6", name: "Healthcare", expenseCount: 2, totalAmount: 85.0 },
  { id: "7", name: "Education", expenseCount: 1, totalAmount: 50.0 },
]

const translations = {
  en: {
    manageCategories: "Manage Categories",
    createAndOrganize: "Create and organize your expense categories",
    addNewCategory: "Add New Category",
    createNewCategory: "Create New Category",
    addNewCategoryDesc: "Add a new category to organize your expenses better.",
    categoryName: "Category Name",
    categoryPlaceholder: "e.g., Travel, Subscriptions",
    cancel: "Cancel",
    createCategory: "Create Category",
    editCategory: "Edit Category",
    updateCategory: "Update Category",
    editCategoryDesc: "Update the category name.",
    yourCategories: "Your Categories",
    categoriesTotal: "categories • Total expenses tracked",
    totalAmount: "Total Amount:",
    transactions: "Transactions:",
    edit: "Edit",
    delete: "Delete",
    deleteCategory: "Delete Category",
    deleteCategoryDesc:
      "Are you sure you want to delete this category? This action cannot be undone and will affect all associated transactions.",
    required: "*",
  },
  pt: {
    manageCategories: "Gerenciar Categorias",
    createAndOrganize: "Crie e organize suas categorias de despesas",
    addNewCategory: "Adicionar Nova Categoria",
    createNewCategory: "Criar Nova Categoria",
    addNewCategoryDesc: "Adicione uma nova categoria para organizar melhor suas despesas.",
    categoryName: "Nome da Categoria",
    categoryPlaceholder: "ex: Viagem, Assinaturas",
    cancel: "Cancelar",
    createCategory: "Criar Categoria",
    editCategory: "Editar Categoria",
    updateCategory: "Atualizar Categoria",
    editCategoryDesc: "Atualize o nome da categoria.",
    yourCategories: "Suas Categorias",
    categoriesTotal: "categorias • Total de despesas rastreadas",
    totalAmount: "Valor Total:",
    transactions: "Transações:",
    edit: "Editar",
    delete: "Excluir",
    deleteCategory: "Excluir Categoria",
    deleteCategoryDesc:
      "Tem certeza de que deseja excluir esta categoria? Esta ação não pode ser desfeita e afetará todas as transações associadas.",
    required: "*",
  },
}

interface CategoryManagerProps {
  language: string
}

export function CategoryManager({ language }: CategoryManagerProps) {
  const [categories, setCategories] = useState<Category[]>(mockCategories)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [editCategoryName, setEditCategoryName] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const t = translations[language as keyof typeof translations]

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCategoryName.trim()) return

    const newCategory: Category = {
      id: Date.now().toString(),
      name: newCategoryName.trim(),
      expenseCount: 0,
      totalAmount: 0,
    }

    setCategories((prev) => [...prev, newCategory])
    setNewCategoryName("")
    setIsAddDialogOpen(false)
  }

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
    setEditCategoryName(category.name)
    setIsEditDialogOpen(true)
  }

  const handleUpdateCategory = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editCategoryName.trim() || !editingCategory) return

    setCategories((prev) =>
      prev.map((cat) => (cat.id === editingCategory.id ? { ...cat, name: editCategoryName.trim() } : cat)),
    )
    setEditingCategory(null)
    setEditCategoryName("")
    setIsEditDialogOpen(false)
  }

  const handleDeleteCategory = (categoryId: string) => {
    setCategories((prev) => prev.filter((cat) => cat.id !== categoryId))
  }

  return (
    <div className="space-y-6">
      {/* Add Category Card */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif">{t.manageCategories}</CardTitle>
          <CardDescription>{t.createAndOrganize}</CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                {t.addNewCategory}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t.createNewCategory}</DialogTitle>
                <DialogDescription>{t.addNewCategoryDesc}</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddCategory} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="categoryName">
                    {t.categoryName} {t.required}
                  </Label>
                  <Input
                    id="categoryName"
                    placeholder={t.categoryPlaceholder}
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    {t.cancel}
                  </Button>
                  <Button type="submit">{t.createCategory}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Edit Category Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.editCategory}</DialogTitle>
            <DialogDescription>{t.editCategoryDesc}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateCategory} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editCategoryName">
                {t.categoryName} {t.required}
              </Label>
              <Input
                id="editCategoryName"
                placeholder={t.categoryPlaceholder}
                value={editCategoryName}
                onChange={(e) => setEditCategoryName(e.target.value)}
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                {t.cancel}
              </Button>
              <Button type="submit">{t.updateCategory}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Categories List */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif">{t.yourCategories}</CardTitle>
          <CardDescription>
            {categories.length} {t.categoriesTotal}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <div
                key={category.id}
                className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-medium text-foreground">{category.name}</h3>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handleEditCategory(category)} title={t.edit}>
                      <Edit className="h-3 w-3" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          title={t.delete}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t.deleteCategory}</AlertDialogTitle>
                          <AlertDialogDescription>{t.deleteCategoryDesc}</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteCategory(category.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {t.delete}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t.totalAmount}</span>
                    <span className="font-medium">${category.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t.transactions}</span>
                    <Badge variant="secondary" className="text-xs">
                      {category.expenseCount}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
