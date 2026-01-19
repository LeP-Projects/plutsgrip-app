import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/Card"
import { Button } from "@/components/Button"
import { Input } from "@/components/Input"
import { Label } from "@/components/Label"
import { PlusCircle, Trash2, Edit, Loader2, AlertCircle } from "lucide-react"
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
import { apiService, type Category } from "@/services/api"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/Select"

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
  const [categories, setCategories] = useState<Category[]>([])
  const [newCategoryName, setNewCategoryName] = useState("")
  const [newCategoryType, setNewCategoryType] = useState<"income" | "expense">("expense")
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [editCategoryName, setEditCategoryName] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)

  const t = translations[language as keyof typeof translations]

  // Load categories on component mount
  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      setIsLoadingCategories(true)
      setError(null)
      const data = await apiService.listCategories()
      setCategories(data.categories)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load categories"
      setError(errorMessage)
      console.error("Error loading categories:", err)
    } finally {
      setIsLoadingCategories(false)
    }
  }

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCategoryName.trim()) return

    try {
      setIsLoading(true)
      setError(null)
      const newCategory = await apiService.createCategory({
        name: newCategoryName.trim(),
        type: newCategoryType,
      })

      setCategories((prev) => [...prev, newCategory])
      setNewCategoryName("")
      setNewCategoryType("expense")
      setIsAddDialogOpen(false)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create category"
      setError(errorMessage)
      console.error("Error creating category:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
    setEditCategoryName(category.name)
    setIsEditDialogOpen(true)
  }

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editCategoryName.trim() || !editingCategory) return

    try {
      setIsLoading(true)
      setError(null)
      const updatedCategory = await apiService.updateCategory(editingCategory.id, {
        name: editCategoryName.trim(),
      })

      setCategories((prev) =>
        prev.map((cat) => (cat.id === editingCategory.id ? updatedCategory : cat)),
      )
      setEditingCategory(null)
      setEditCategoryName("")
      setIsEditDialogOpen(false)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update category"
      setError(errorMessage)
      console.error("Error updating category:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      setError(null)
      await apiService.deleteCategory(categoryId)
      setCategories((prev) => prev.filter((cat) => cat.id !== categoryId))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete category"
      setError(errorMessage)
      console.error("Error deleting category:", err)
    }
  }

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg">
          <AlertCircle className="h-4 w-4" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Add Category Card */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif">{t.manageCategories}</CardTitle>
          <CardDescription>{t.createAndOrganize}</CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={isLoading}>
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
                    disabled={isLoading}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categoryType">
                    Tipo {t.required}
                  </Label>
                  <Select value={newCategoryType} onValueChange={(value) => setNewCategoryType(value as "income" | "expense")} disabled={isLoading}>
                    <SelectTrigger id="categoryType">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="expense">Despesa</SelectItem>
                      <SelectItem value="income">Renda</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isLoading}>
                    {t.cancel}
                  </Button>
                  <Button type="submit" loading={isLoading} loadingText={t.createCategory}>
                    {t.createCategory}
                  </Button>
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
                disabled={isLoading}
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isLoading}>
                {t.cancel}
              </Button>
              <Button type="submit" loading={isLoading} loadingText={t.updateCategory}>
                {t.updateCategory}
              </Button>
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
          {isLoadingCategories ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No categories yet. Create one to get started!</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-foreground">{category.name}</h3>
                      <p className="text-xs text-muted-foreground capitalize mt-1">
                        {category.type === "income" ? "Renda" : "Despesa"}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleEditCategory(category)} title={t.edit} disabled={isLoading}>
                        <Edit className="h-3 w-3" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            title={t.delete}
                            disabled={isLoading}
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

                  {category.color && (
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-4 h-4 rounded-full border border-border"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="text-xs text-muted-foreground">{category.color}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
