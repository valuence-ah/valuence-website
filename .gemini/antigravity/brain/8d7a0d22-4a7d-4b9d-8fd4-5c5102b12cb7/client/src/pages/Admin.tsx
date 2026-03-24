import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { TeamMember, PortfolioCompany, User, SiteContent, MediaUpload, SitePage, ContentSection, NavigationLink, GlobalSetting } from "@shared/schema";
import { SECTION_TYPES } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Building2, LogOut, Plus, Pencil, Trash2, X, Save, Loader2, FileText, Image, Upload, LayoutDashboard, ChevronUp, ChevronDown, Globe, Settings, Navigation, Link2, Activity, BarChart3 } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { ObjectUploader } from "@/components/ObjectUploader";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

// Helper to get user-friendly error message
function getErrorMessage(error: unknown, defaultMessage: string): string {
  if (error instanceof Error) {
    if (error.message.includes("401")) {
      return "Not authorized. Please log in again.";
    }
    if (error.message.includes("403")) {
      return "Access denied. You don't have permission for this action.";
    }
  }
  return defaultMessage;
}

function TeamMemberForm({ 
  member, 
  onSave, 
  onCancel, 
  isPending 
}: { 
  member?: TeamMember; 
  onSave: (data: any) => void; 
  onCancel: () => void;
  isPending: boolean;
}) {
  const [formData, setFormData] = useState({
    name: member?.name || "",
    title: member?.title || "",
    category: member?.category || "gp",
    bio: member?.bio || "",
    imageUrl: member?.imageUrl || "",
    linkedinUrl: member?.linkedinUrl || "",
    order: member?.order || 1,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleGetUploadParameters = async () => {
    const response = await apiRequest("POST", "/api/objects/upload", {});
    const data = await response.json();
    return {
      method: "PUT" as const,
      url: data.uploadURL,
    };
  };

  const handleUploadComplete = async (result: any, field: string) => {
    if (result.successful && result.successful.length > 0) {
      const file = result.successful[0];
      const rawUrl = file.uploadURL?.split("?")[0] || file.uploadURL;
      try {
        const finalizeResponse = await apiRequest("POST", "/api/objects/finalize", { rawUrl });
        const finalizeData = await finalizeResponse.json();
        setFormData({ ...formData, [field]: finalizeData.url });
      } catch (error) {
        console.error("Error finalizing upload:", error);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          data-testid="input-team-name"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          data-testid="input-team-title"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select
          value={formData.category}
          onValueChange={(value) => setFormData({ ...formData, category: value })}
        >
          <SelectTrigger data-testid="select-team-category">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gp">General Partners</SelectItem>
            <SelectItem value="ic">Investment Committee</SelectItem>
            <SelectItem value="apac">APAC/Special Advisors</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          rows={3}
          data-testid="input-team-bio"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="imageUrl">Image Code (e.g., AH, GC)</Label>
        <div className="flex gap-2">
          <Input
            id="imageUrl"
            value={formData.imageUrl}
          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
          placeholder="Two-letter code for team member image"
          data-testid="input-team-image"
          />
          <ObjectUploader
            onGetUploadParameters={handleGetUploadParameters}
            onComplete={(res) => handleUploadComplete(res, "imageUrl")}
          >
            <Upload className="h-4 w-4" />
          </ObjectUploader>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
        <Input
          id="linkedinUrl"
          value={formData.linkedinUrl}
          onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
          data-testid="input-team-linkedin"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="order">Display Order</Label>
        <Input
          id="order"
          type="number"
          value={formData.order}
          onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
          min={1}
          data-testid="input-team-order"
        />
      </div>
      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={isPending} data-testid="button-save-team">
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Save className="mr-2 h-4 w-4" />
          Save
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} data-testid="button-cancel-team">
          <X className="mr-2 h-4 w-4" />
          Cancel
        </Button>
      </div>
    </form>
  );
}

function PortfolioCompanyForm({ 
  company, 
  onSave, 
  onCancel,
  isPending 
}: { 
  company?: PortfolioCompany; 
  onSave: (data: any) => void; 
  onCancel: () => void;
  isPending: boolean;
}) {
  const [formData, setFormData] = useState({
    name: company?.name || "",
    shortDescription: company?.shortDescription || "",
    description: company?.description || "",
    category: company?.category || "cleantech",
    logoUrl: company?.logoUrl || "",
    featuredImageUrl: company?.featuredImageUrl || "",
    websiteUrl: company?.websiteUrl || "",
    order: company?.order || 1,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleGetUploadParameters = async () => {
    const response = await apiRequest("POST", "/api/objects/upload", {});
    const data = await response.json();
    return {
      method: "PUT" as const,
      url: data.uploadURL,
    };
  };

  const handleUploadComplete = async (result: any, field: string) => {
    if (result.successful && result.successful.length > 0) {
      const file = result.successful[0];
      const rawUrl = file.uploadURL?.split("?")[0] || file.uploadURL;
      try {
        const finalizeResponse = await apiRequest("POST", "/api/objects/finalize", { rawUrl });
        const finalizeData = await finalizeResponse.json();
        setFormData({ ...formData, [field]: finalizeData.url });
      } catch (error) {
        console.error("Error finalizing upload:", error);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Company Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          data-testid="input-company-name"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="shortDescription">Short Description</Label>
        <Input
          id="shortDescription"
          value={formData.shortDescription}
          onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
          data-testid="input-company-short-desc"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Full Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
          required
          data-testid="input-company-description"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select
          value={formData.category}
          onValueChange={(value) => setFormData({ ...formData, category: value })}
        >
          <SelectTrigger data-testid="select-company-category">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cleantech">Cleantech</SelectItem>
            <SelectItem value="techbio">Techbio</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="logoUrl">Logo Code (e.g., KROSSLINKER_LOGO)</Label>
        <div className="flex gap-2">
          <Input
            id="logoUrl"
            value={formData.logoUrl}
          onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
          placeholder="Image code for company logo"
          data-testid="input-company-logo"
          />
          <ObjectUploader
            onGetUploadParameters={handleGetUploadParameters}
            onComplete={(res) => handleUploadComplete(res, "logoUrl")}
          >
            <Upload className="h-4 w-4" />
          </ObjectUploader>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="featuredImageUrl">Featured Image Code (e.g., KROSSLINKER)</Label>
        <div className="flex gap-2">
          <Input
            id="featuredImageUrl"
            value={formData.featuredImageUrl}
          onChange={(e) => setFormData({ ...formData, featuredImageUrl: e.target.value })}
          placeholder="Image code for featured image"
          data-testid="input-company-featured"
          />
          <ObjectUploader
            onGetUploadParameters={handleGetUploadParameters}
            onComplete={(res) => handleUploadComplete(res, "featuredImageUrl")}
          >
            <Upload className="h-4 w-4" />
          </ObjectUploader>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="websiteUrl">Website URL</Label>
        <Input
          id="websiteUrl"
          value={formData.websiteUrl}
          onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
          data-testid="input-company-website"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="order">Display Order</Label>
        <Input
          id="order"
          type="number"
          value={formData.order}
          onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
          min={1}
          data-testid="input-company-order"
        />
      </div>
      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={isPending} data-testid="button-save-company">
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Save className="mr-2 h-4 w-4" />
          Save
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} data-testid="button-cancel-company">
          <X className="mr-2 h-4 w-4" />
          Cancel
        </Button>
      </div>
    </form>
  );
}

function TeamSection() {
  const { toast } = useToast();
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { data: members = [], isLoading } = useQuery<TeamMember[]>({
    queryKey: ["/api/team"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/team", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team"] });
      setIsAddDialogOpen(false);
      toast({ title: "Team member created successfully" });
    },
    onError: (error) => {
      toast({ title: getErrorMessage(error, "Failed to create team member"), variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await apiRequest("PATCH", `/api/team/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team"] });
      setIsEditDialogOpen(false);
      setEditingMember(null);
      toast({ title: "Team member updated successfully" });
    },
    onError: (error) => {
      toast({ title: getErrorMessage(error, "Failed to update team member"), variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/team/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team"] });
      toast({ title: "Team member deleted successfully" });
    },
    onError: (error) => {
      toast({ title: getErrorMessage(error, "Failed to delete team member"), variant: "destructive" });
    },
  });

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "gp": return "General Partner";
      case "ic": return "Investment Committee";
      case "apac": return "APAC/Special Advisor";
      default: return category;
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Team Members ({members.length})</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-team">
              <Plus className="mr-2 h-4 w-4" />
              Add Team Member
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Team Member</DialogTitle>
              <DialogDescription>Fill in the details to add a new team member.</DialogDescription>
            </DialogHeader>
            <TeamMemberForm
              onSave={(data) => createMutation.mutate(data)}
              onCancel={() => setIsAddDialogOpen(false)}
              isPending={createMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {members.map((member) => (
          <Card key={member.id} data-testid={`card-team-${member.id}`}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src="" alt={member.name} />
                  <AvatarFallback>{member.name.split(" ").map(n => n[0]).join("").slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold" data-testid={`text-team-name-${member.id}`}>{member.name}</p>
                  <p className="text-sm text-muted-foreground">{member.title} - {getCategoryLabel(member.category)}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Dialog open={isEditDialogOpen && editingMember?.id === member.id} onOpenChange={(open) => {
                  setIsEditDialogOpen(open);
                  if (!open) setEditingMember(null);
                }}>
                  <DialogTrigger asChild>
                    <Button 
                      size="icon" 
                      variant="outline" 
                      onClick={() => setEditingMember(member)}
                      data-testid={`button-edit-team-${member.id}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Edit Team Member</DialogTitle>
                      <DialogDescription>Update the team member's information.</DialogDescription>
                    </DialogHeader>
                    {editingMember && (
                      <TeamMemberForm
                        member={editingMember}
                        onSave={(data) => updateMutation.mutate({ id: editingMember.id, data })}
                        onCancel={() => {
                          setIsEditDialogOpen(false);
                          setEditingMember(null);
                        }}
                        isPending={updateMutation.isPending}
                      />
                    )}
                  </DialogContent>
                </Dialog>
                <Button 
                  size="icon" 
                  variant="destructive"
                  onClick={() => {
                    if (confirm("Are you sure you want to delete this team member?")) {
                      deleteMutation.mutate(member.id);
                    }
                  }}
                  data-testid={`button-delete-team-${member.id}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function PortfolioSection() {
  const { toast } = useToast();
  const [editingCompany, setEditingCompany] = useState<PortfolioCompany | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { data: companies = [], isLoading } = useQuery<PortfolioCompany[]>({
    queryKey: ["/api/portfolio"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/portfolio", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio"] });
      setIsAddDialogOpen(false);
      toast({ title: "Portfolio company created successfully" });
    },
    onError: (error) => {
      toast({ title: getErrorMessage(error, "Failed to create portfolio company"), variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await apiRequest("PATCH", `/api/portfolio/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio"] });
      setIsEditDialogOpen(false);
      setEditingCompany(null);
      toast({ title: "Portfolio company updated successfully" });
    },
    onError: (error) => {
      toast({ title: getErrorMessage(error, "Failed to update portfolio company"), variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/portfolio/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio"] });
      toast({ title: "Portfolio company deleted successfully" });
    },
    onError: (error) => {
      toast({ title: getErrorMessage(error, "Failed to delete portfolio company"), variant: "destructive" });
    },
  });

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Portfolio Companies ({companies.length})</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-company">
              <Plus className="mr-2 h-4 w-4" />
              Add Company
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Portfolio Company</DialogTitle>
              <DialogDescription>Fill in the details to add a new portfolio company.</DialogDescription>
            </DialogHeader>
            <PortfolioCompanyForm
              onSave={(data) => createMutation.mutate(data)}
              onCancel={() => setIsAddDialogOpen(false)}
              isPending={createMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {companies.map((company) => (
          <Card key={company.id} data-testid={`card-company-${company.id}`}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 rounded-md">
                  <AvatarImage src="" alt={company.name} />
                  <AvatarFallback className="rounded-md">{company.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold" data-testid={`text-company-name-${company.id}`}>{company.name}</p>
                  <p className="text-sm text-muted-foreground capitalize">{company.category} - {company.shortDescription}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Dialog open={isEditDialogOpen && editingCompany?.id === company.id} onOpenChange={(open) => {
                  setIsEditDialogOpen(open);
                  if (!open) setEditingCompany(null);
                }}>
                  <DialogTrigger asChild>
                    <Button 
                      size="icon" 
                      variant="outline" 
                      onClick={() => setEditingCompany(company)}
                      data-testid={`button-edit-company-${company.id}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Edit Portfolio Company</DialogTitle>
                      <DialogDescription>Update the company's information.</DialogDescription>
                    </DialogHeader>
                    {editingCompany && (
                      <PortfolioCompanyForm
                        company={editingCompany}
                        onSave={(data) => updateMutation.mutate({ id: editingCompany.id, data })}
                        onCancel={() => {
                          setIsEditDialogOpen(false);
                          setEditingCompany(null);
                        }}
                        isPending={updateMutation.isPending}
                      />
                    )}
                  </DialogContent>
                </Dialog>
                <Button 
                  size="icon" 
                  variant="destructive"
                  onClick={() => {
                    if (confirm("Are you sure you want to delete this company?")) {
                      deleteMutation.mutate(company.id);
                    }
                  }}
                  data-testid={`button-delete-company-${company.id}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Default site content structure
const defaultSiteContent = {
  hero: {
    title: "CREATING A CLEANER AND HEALTHIER FUTURE THROUGH THE POWER OF",
    highlight: "DEEPTECH",
    subtitle: "We invest in visionary founders developing world-changing technologies that accelerate planetary and human health.",
    button1: "Our Focus",
    button2: "View Portfolio",
  },
  focus: {
    label: "Our Focus",
    title: "DEEPTECH ACCELERATING",
    highlight: "CLEANTECH & TECHBIO",
    description: "Deeptech is the unsung hero powering a greener future and accelerating medical breakthroughs that refine global healthcare.",
    cleantech_title: "Cleantech",
    cleantech_desc: "Zero-emission processes and advanced materials that slash waste and cut carbon",
    techbio_title: "Techbio",
    techbio_desc: "AI-first discovery engines and regenerative platforms for novel therapies",
    global_title: "Global Reach",
    global_desc: "North America & Asia - Two ecosystems, one global sandbox",
    stage_title: "Pre-Seed to Series A",
    stage_desc: "Early-stage investments in world-changing technologies",
  },
  team: {
    title: "We have built, scaled & exited",
    highlight: "businesses.",
    point1: "with 5 successful exits",
    point2: "who scaled cleantech & techbio businesses",
    point3: "who actively support visionary founders",
  },
};

function SiteContentSection() {
  const { toast } = useToast();
  const [editedContent, setEditedContent] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const { data: content = [], isLoading } = useQuery<SiteContent[]>({
    queryKey: ["/api/site-content"],
  });

  const contentMap = content.reduce((acc, item) => {
    acc[item.id] = item.value;
    return acc;
  }, {} as Record<string, string>);

  const getValue = (section: string, key: string) => {
    const id = `${section}_${key}`;
    if (editedContent[id] !== undefined) return editedContent[id];
    if (contentMap[id]) return contentMap[id];
    const sectionDefaults = defaultSiteContent[section as keyof typeof defaultSiteContent];
    if (sectionDefaults && key in sectionDefaults) {
      return sectionDefaults[key as keyof typeof sectionDefaults];
    }
    return "";
  };

  const handleChange = (section: string, key: string, value: string) => {
    const id = `${section}_${key}`;
    setEditedContent({ ...editedContent, [id]: value });
  };

  const saveAll = async () => {
    setIsSaving(true);
    try {
      const items = Object.entries(editedContent).map(([id, value]) => {
        const [section, ...keyParts] = id.split("_");
        const key = keyParts.join("_");
        return { id, section, key, value };
      });
      
      if (items.length === 0) {
        toast({ title: "No changes to save" });
        setIsSaving(false);
        return;
      }

      await apiRequest("PUT", "/api/site-content/batch", { items });
      queryClient.invalidateQueries({ queryKey: ["/api/site-content"] });
      setEditedContent({});
      toast({ title: "Content saved successfully" });
    } catch (error) {
      toast({ title: getErrorMessage(error, "Failed to save content"), variant: "destructive" });
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  const hasChanges = Object.keys(editedContent).length > 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-muted-foreground">Edit the text content that appears on your website pages.</p>
        <Button onClick={saveAll} disabled={isSaving || !hasChanges} data-testid="button-save-content">
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Save className="mr-2 h-4 w-4" />
          Save All Changes
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hero Section</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Main Title</Label>
            <Textarea
              value={getValue("hero", "title")}
              onChange={(e) => handleChange("hero", "title", e.target.value)}
              rows={2}
              data-testid="input-hero-title"
            />
          </div>
          <div className="space-y-2">
            <Label>Highlight Word</Label>
            <Input
              value={getValue("hero", "highlight")}
              onChange={(e) => handleChange("hero", "highlight", e.target.value)}
              data-testid="input-hero-highlight"
            />
          </div>
          <div className="space-y-2">
            <Label>Subtitle</Label>
            <Textarea
              value={getValue("hero", "subtitle")}
              onChange={(e) => handleChange("hero", "subtitle", e.target.value)}
              rows={2}
              data-testid="input-hero-subtitle"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Button 1 Text</Label>
              <Input
                value={getValue("hero", "button1")}
                onChange={(e) => handleChange("hero", "button1", e.target.value)}
                data-testid="input-hero-button1"
              />
            </div>
            <div className="space-y-2">
              <Label>Button 2 Text</Label>
              <Input
                value={getValue("hero", "button2")}
                onChange={(e) => handleChange("hero", "button2", e.target.value)}
                data-testid="input-hero-button2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Our Focus Section</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Section Label</Label>
            <Input
              value={getValue("focus", "label")}
              onChange={(e) => handleChange("focus", "label", e.target.value)}
              data-testid="input-focus-label"
            />
          </div>
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={getValue("focus", "title")}
              onChange={(e) => handleChange("focus", "title", e.target.value)}
              data-testid="input-focus-title"
            />
          </div>
          <div className="space-y-2">
            <Label>Highlight</Label>
            <Input
              value={getValue("focus", "highlight")}
              onChange={(e) => handleChange("focus", "highlight", e.target.value)}
              data-testid="input-focus-highlight"
            />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={getValue("focus", "description")}
              onChange={(e) => handleChange("focus", "description", e.target.value)}
              rows={2}
              data-testid="input-focus-description"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Team Section</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={getValue("team", "title")}
              onChange={(e) => handleChange("team", "title", e.target.value)}
              placeholder="We have built, scaled & exited"
              data-testid="input-team-section-title"
            />
          </div>
          <div className="space-y-2">
            <Label>Highlight</Label>
            <Input
              value={getValue("team", "highlight")}
              onChange={(e) => handleChange("team", "highlight", e.target.value)}
              placeholder="businesses."
              data-testid="input-team-section-highlight"
            />
          </div>
          <div className="space-y-2">
            <Label>Entrepreneurs Point (appears after "Entrepreneurs")</Label>
            <Input
              value={getValue("team", "point1")}
              onChange={(e) => handleChange("team", "point1", e.target.value)}
              placeholder="with 5 successful exits"
              data-testid="input-team-point1"
            />
          </div>
          <div className="space-y-2">
            <Label>Operators Point (appears after "Operators")</Label>
            <Input
              value={getValue("team", "point2")}
              onChange={(e) => handleChange("team", "point2", e.target.value)}
              placeholder="who scaled cleantech & techbio businesses"
              data-testid="input-team-point2"
            />
          </div>
          <div className="space-y-2">
            <Label>Investors Point (appears after "Investors")</Label>
            <Input
              value={getValue("team", "point3")}
              onChange={(e) => handleChange("team", "point3", e.target.value)}
              placeholder="who actively support visionary founders"
              data-testid="input-team-point3"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MediaSection() {
  const { toast } = useToast();
  
  const { data: uploads = [], isLoading } = useQuery<MediaUpload[]>({
    queryKey: ["/api/media"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/media/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/media"] });
      toast({ title: "Media deleted successfully" });
    },
    onError: (error) => {
      toast({ title: getErrorMessage(error, "Failed to delete media"), variant: "destructive" });
    },
  });

  const createMediaMutation = useMutation({
    mutationFn: async (data: { filename: string; originalName: string; url: string; mimeType?: string }) => {
      return await apiRequest("POST", "/api/media", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/media"] });
      toast({ title: "Media uploaded successfully" });
    },
    onError: (error) => {
      toast({ title: getErrorMessage(error, "Failed to save media"), variant: "destructive" });
    },
  });

  const handleGetUploadParameters = async () => {
    const response = await apiRequest("POST", "/api/objects/upload", {});
    const data = await response.json();
    return {
      method: "PUT" as const,
      url: data.uploadURL,
    };
  };

  const handleUploadComplete = async (result: any) => {
    if (result.successful && result.successful.length > 0) {
      const file = result.successful[0];
      const rawUrl = file.uploadURL?.split("?")[0] || file.uploadURL;
      
      try {
        const finalizeResponse = await apiRequest("POST", "/api/objects/finalize", { rawUrl });
        const finalizeData = await finalizeResponse.json();
        const normalizedUrl = finalizeData.url;
        
        createMediaMutation.mutate({
          filename: file.name || `upload-${Date.now()}`,
          originalName: file.name || "uploaded-file",
          url: normalizedUrl,
          mimeType: file.type,
        });
      } catch (error) {
        console.error("Error finalizing upload:", error);
        toast({ title: getErrorMessage(error, "Failed to finalize upload"), variant: "destructive" });
      }
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-muted-foreground">Upload and manage images and media for your website.</p>
        <ObjectUploader
          maxNumberOfFiles={1}
          maxFileSize={52428800}
          onGetUploadParameters={handleGetUploadParameters}
          onComplete={handleUploadComplete}
          buttonVariant="default"
        >
          <Upload className="mr-2 h-4 w-4" />
          Upload Media
        </ObjectUploader>
      </div>

      {uploads.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Image className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No media uploaded yet.</p>
            <p className="text-sm">Upload images and videos to use on your website.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {uploads.map((upload) => (
            <Card key={upload.id} className="overflow-hidden" data-testid={`card-media-${upload.id}`}>
              <div className="aspect-square bg-muted flex items-center justify-center">
                {upload.mimeType?.startsWith("image/") ? (
                  <img 
                    src={upload.url} 
                    alt={upload.originalName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Image className="h-12 w-12 text-muted-foreground" />
                )}
              </div>
              <CardContent className="p-3">
                <p className="text-sm font-medium truncate" title={upload.originalName}>
                  {upload.originalName}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(upload.url);
                      toast({ title: "URL copied to clipboard" });
                    }}
                    data-testid={`button-copy-url-${upload.id}`}
                  >
                    Copy URL
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (confirm("Delete this media?")) {
                        deleteMutation.mutate(upload.id);
                      }
                    }}
                    data-testid={`button-delete-media-${upload.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function SectionForm({ 
  section, 
  sectionType,
  onSave, 
  onCancel,
  isPending 
}: { 
  section: ContentSection;
  sectionType: typeof SECTION_TYPES[keyof typeof SECTION_TYPES];
  onSave: (data: any) => void; 
  onCancel: () => void;
  isPending: boolean;
}) {
  const [formData, setFormData] = useState<Record<string, any>>(section.data || {});

  const handleChange = (key: string, value: any) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ data: formData });
  };

  const renderField = (field: typeof sectionType.fields[number]) => {
    const fieldWithDefault = field as typeof field & { default?: any };
    const value = formData[field.key] ?? fieldWithDefault.default ?? "";
    
    switch (field.type) {
      case "text":
        return (
          <Input
            value={value}
            onChange={(e) => handleChange(field.key, e.target.value)}
            placeholder={field.label}
            data-testid={`input-section-${field.key}`}
          />
        );
      case "textarea":
      case "richtext":
        return (
          <Textarea
            value={value}
            onChange={(e) => handleChange(field.key, e.target.value)}
            placeholder={field.label}
            rows={3}
            data-testid={`input-section-${field.key}`}
          />
        );
      case "url":
      case "media":
        const handleGetParams = async () => {
          const response = await apiRequest("POST", "/api/objects/upload", {});
          const data = await response.json();
          return {
            method: "PUT" as const,
            url: data.uploadURL,
          };
        };

        const handleComplete = async (result: any) => {
          if (result.successful && result.successful.length > 0) {
            const file = result.successful[0];
            const rawUrl = file.uploadURL?.split("?")[0] || file.uploadURL;
            try {
              const finalizeResponse = await apiRequest("POST", "/api/objects/finalize", { rawUrl });
              const finalizeData = await finalizeResponse.json();
              handleChange(field.key, finalizeData.url);
            } catch (error) {
              console.error("Error finalizing upload:", error);
            }
          }
        };

        return (
          <div className="flex gap-2">
            <Input
              value={value}
              onChange={(e) => handleChange(field.key, e.target.value)}
              placeholder={field.type === "media" ? "Media URL or path" : "https://..."}
              data-testid={`input-section-${field.key}`}
            />
            {field.type === "media" && (
              <ObjectUploader
                onGetUploadParameters={handleGetParams}
                onComplete={handleComplete}
              >
                <Upload className="h-4 w-4" />
              </ObjectUploader>
            )}
          </div>
        );
      case "json":
      case "array":
        return (
          <Textarea
            value={typeof value === "string" ? value : JSON.stringify(value, null, 2)}
            onChange={(e) => {
              try {
                handleChange(field.key, JSON.parse(e.target.value));
              } catch {
                handleChange(field.key, e.target.value);
              }
            }}
            placeholder="JSON data"
            rows={6}
            className="font-mono text-sm"
            data-testid={`input-section-${field.key}`}
          />
        );
      case "boolean":
        return (
          <Select value={value ? "true" : "false"} onValueChange={(v) => handleChange(field.key, v === "true")}>
            <SelectTrigger data-testid={`input-section-${field.key}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Yes</SelectItem>
              <SelectItem value="false">No</SelectItem>
            </SelectContent>
          </Select>
        );
      case "select":
        return (
          <Input
            value={value}
            onChange={(e) => handleChange(field.key, e.target.value)}
            data-testid={`input-section-${field.key}`}
          />
        );
      default: {
        const unknownField = field as { key: string; label: string };
        return (
          <Input
            value={value}
            onChange={(e) => handleChange(unknownField.key, e.target.value)}
            data-testid={`input-section-${unknownField.key}`}
          />
        );
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {sectionType.fields.map((field) => (
        <div key={field.key} className="space-y-2">
          <Label htmlFor={field.key}>{field.label}</Label>
          {renderField(field)}
        </div>
      ))}
      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={isPending} data-testid="button-save-section">
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Save className="mr-2 h-4 w-4" />
          Save
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} data-testid="button-cancel-section">
          <X className="mr-2 h-4 w-4" />
          Cancel
        </Button>
      </div>
    </form>
  );
}

function PageContentSection() {
  const { toast } = useToast();
  const [selectedPageId, setSelectedPageId] = useState<string>("home");
  const [editingSection, setEditingSection] = useState<ContentSection | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { data: pages = [], isLoading: pagesLoading } = useQuery<SitePage[]>({
    queryKey: ["/api/pages"],
  });

  const { data: sections = [], isLoading: sectionsLoading } = useQuery<ContentSection[]>({
    queryKey: ["/api/sections", selectedPageId],
    queryFn: async () => {
      const res = await fetch(`/api/sections/${selectedPageId}`);
      if (!res.ok) throw new Error("Failed to fetch sections");
      return res.json();
    },
    enabled: !!selectedPageId,
  });

  const updateSectionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await apiRequest("PATCH", `/api/sections/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sections", selectedPageId] });
      setIsEditDialogOpen(false);
      setEditingSection(null);
      toast({ title: "Section updated successfully" });
    },
    onError: (error) => {
      toast({ title: getErrorMessage(error, "Failed to update section"), variant: "destructive" });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async (sectionIds: string[]) => {
      return await apiRequest("PUT", `/api/sections/${selectedPageId}/reorder`, { sectionIds });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sections", selectedPageId] });
      toast({ title: "Sections reordered" });
    },
    onError: (error) => {
      toast({ title: getErrorMessage(error, "Failed to reorder sections"), variant: "destructive" });
    },
  });

  const moveSection = (index: number, direction: "up" | "down") => {
    const newSections = [...sections];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= newSections.length) return;
    
    [newSections[index], newSections[swapIndex]] = [newSections[swapIndex], newSections[index]];
    reorderMutation.mutate(newSections.map(s => s.id));
  };

  const getSectionTypeName = (type: string) => {
    return SECTION_TYPES[type as keyof typeof SECTION_TYPES]?.name || type;
  };

  if (pagesLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">Page Content</h2>
          <p className="text-sm text-muted-foreground">Edit the sections on each page of your website.</p>
        </div>
        <Select value={selectedPageId} onValueChange={setSelectedPageId}>
          <SelectTrigger className="w-[200px]" data-testid="select-page">
            <SelectValue placeholder="Select a page" />
          </SelectTrigger>
          <SelectContent>
            {pages.map((page) => (
              <SelectItem key={page.id} value={page.id}>{page.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {sectionsLoading ? (
        <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
      ) : sections.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No sections found for this page.</p>
          </CardContent>
        </Card>
      ) : (
        <Accordion type="single" collapsible className="space-y-2">
          {sections.map((section, index) => {
            const sectionType = SECTION_TYPES[section.sectionType as keyof typeof SECTION_TYPES];
            return (
              <AccordionItem key={section.id} value={section.id} className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3 w-full">
                    <div className="flex flex-col gap-1">
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-5 w-5"
                        onClick={(e) => { e.stopPropagation(); moveSection(index, "up"); }}
                        disabled={index === 0}
                        data-testid={`button-move-up-${section.id}`}
                      >
                        <ChevronUp className="h-3 w-3" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-5 w-5"
                        onClick={(e) => { e.stopPropagation(); moveSection(index, "down"); }}
                        disabled={index === sections.length - 1}
                        data-testid={`button-move-down-${section.id}`}
                      >
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium">{section.title}</p>
                      <p className="text-sm text-muted-foreground">{getSectionTypeName(section.sectionType)}</p>
                    </div>
                    <Badge variant="outline">{index + 1}</Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pt-4 pb-2">
                    {sectionType ? (
                      <SectionForm
                        section={section}
                        sectionType={sectionType}
                        onSave={(data) => updateSectionMutation.mutate({ id: section.id, data })}
                        onCancel={() => {}}
                        isPending={updateSectionMutation.isPending}
                      />
                    ) : (
                      <div className="text-muted-foreground text-sm">
                        <p>Section type "{section.sectionType}" is not editable in the admin panel.</p>
                        <p className="mt-2">Raw data:</p>
                        <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                          {JSON.stringify(section.data, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}
    </div>
  );
}

function NavigationSection() {
  const { toast } = useToast();
  const [location, setLocation] = useState<string>("header");
  const [editingLink, setEditingLink] = useState<NavigationLink | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ label: "", url: "", location: "header", order: 0 });

  const { data: links = [], isLoading } = useQuery<NavigationLink[]>({
    queryKey: ["/api/navigation", location],
    queryFn: async () => {
      const res = await fetch(`/api/navigation?location=${location}`);
      if (!res.ok) throw new Error("Failed to fetch navigation");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/navigation", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/navigation", location] });
      setIsAddDialogOpen(false);
      setFormData({ label: "", url: "", location: "header", order: 0 });
      toast({ title: "Link created successfully" });
    },
    onError: (error) => {
      toast({ title: getErrorMessage(error, "Failed to create link"), variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await apiRequest("PATCH", `/api/navigation/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/navigation", location] });
      setIsEditDialogOpen(false);
      setEditingLink(null);
      toast({ title: "Link updated successfully" });
    },
    onError: (error) => {
      toast({ title: getErrorMessage(error, "Failed to update link"), variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/navigation/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/navigation", location] });
      toast({ title: "Link deleted successfully" });
    },
    onError: (error) => {
      toast({ title: getErrorMessage(error, "Failed to delete link"), variant: "destructive" });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async (linkIds: string[]) => {
      return await apiRequest("PUT", `/api/navigation/${location}/reorder`, { linkIds });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/navigation", location] });
    },
  });

  const moveLink = (index: number, direction: "up" | "down") => {
    const newLinks = [...links];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= newLinks.length) return;
    
    [newLinks[index], newLinks[swapIndex]] = [newLinks[swapIndex], newLinks[index]];
    reorderMutation.mutate(newLinks.map(l => l.id));
  };

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">Navigation Links</h2>
          <p className="text-sm text-muted-foreground">Manage header and footer navigation links.</p>
        </div>
        <div className="flex gap-2">
          <Select value={location} onValueChange={setLocation}>
            <SelectTrigger className="w-[120px]" data-testid="select-nav-location">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="header">Header</SelectItem>
              <SelectItem value="footer">Footer</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-nav">
                <Plus className="mr-2 h-4 w-4" />
                Add Link
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Navigation Link</DialogTitle>
                <DialogDescription>Add a new link to the {location} navigation.</DialogDescription>
              </DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate({ ...formData, location, order: links.length }); }} className="space-y-4">
                <div className="space-y-2">
                  <Label>Label</Label>
                  <Input
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    placeholder="e.g. About Us"
                    required
                    data-testid="input-nav-label"
                  />
                </div>
                <div className="space-y-2">
                  <Label>URL</Label>
                  <Input
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="e.g. /about or https://..."
                    required
                    data-testid="input-nav-url"
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={createMutation.isPending} data-testid="button-save-nav">
                    {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {links.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Link2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No links in {location} navigation.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {links.map((link, index) => (
            <Card key={link.id} data-testid={`card-nav-${link.id}`}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-5 w-5"
                      onClick={() => moveLink(index, "up")}
                      disabled={index === 0}
                      data-testid={`button-nav-up-${link.id}`}
                    >
                      <ChevronUp className="h-3 w-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-5 w-5"
                      onClick={() => moveLink(index, "down")}
                      disabled={index === links.length - 1}
                      data-testid={`button-nav-down-${link.id}`}
                    >
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </div>
                  <div>
                    <p className="font-medium">{link.label}</p>
                    <p className="text-sm text-muted-foreground">{link.url}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Dialog open={isEditDialogOpen && editingLink?.id === link.id} onOpenChange={(open) => {
                    setIsEditDialogOpen(open);
                    if (!open) setEditingLink(null);
                  }}>
                    <DialogTrigger asChild>
                      <Button 
                        size="icon" 
                        variant="outline" 
                        onClick={() => { setEditingLink(link); setFormData({ label: link.label, url: link.url, location: link.location, order: link.order ?? 0 }); }}
                        data-testid={`button-edit-nav-${link.id}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Navigation Link</DialogTitle>
                        <DialogDescription>Update this navigation link.</DialogDescription>
                      </DialogHeader>
                      {editingLink && (
                        <form onSubmit={(e) => { e.preventDefault(); updateMutation.mutate({ id: editingLink.id, data: formData }); }} className="space-y-4">
                          <div className="space-y-2">
                            <Label>Label</Label>
                            <Input
                              value={formData.label}
                              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                              required
                              data-testid="input-edit-nav-label"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>URL</Label>
                            <Input
                              value={formData.url}
                              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                              required
                              data-testid="input-edit-nav-url"
                            />
                          </div>
                          <div className="flex gap-2 pt-4">
                            <Button type="submit" disabled={updateMutation.isPending}>
                              {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                              Save
                            </Button>
                            <Button type="button" variant="outline" onClick={() => { setIsEditDialogOpen(false); setEditingLink(null); }}>
                              Cancel
                            </Button>
                          </div>
                        </form>
                      )}
                    </DialogContent>
                  </Dialog>
                  <Button 
                    size="icon" 
                    variant="destructive"
                    onClick={() => {
                      if (confirm("Delete this navigation link?")) {
                        deleteMutation.mutate(link.id);
                      }
                    }}
                    data-testid={`button-delete-nav-${link.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function GlobalSettingsSection() {
  const { toast } = useToast();
  const [editedSettings, setEditedSettings] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const { data: settings = [], isLoading } = useQuery<GlobalSetting[]>({
    queryKey: ["/api/settings"],
  });

  const settingsMap = settings.reduce((acc, item) => {
    acc[item.id] = item.value || "";
    return acc;
  }, {} as Record<string, string>);

  const getValue = (id: string, defaultValue: string = "") => {
    if (editedSettings[id] !== undefined) return editedSettings[id];
    return settingsMap[id] || defaultValue;
  };

  const handleChange = (id: string, value: string) => {
    setEditedSettings({ ...editedSettings, [id]: value });
  };

  const saveAll = async () => {
    setIsSaving(true);
    try {
      const items = Object.entries(editedSettings).map(([id, value]) => {
        const existing = settings.find(s => s.id === id);
        return { 
          id, 
          category: existing?.category || "general", 
          key: existing?.key || id, 
          value 
        };
      });
      
      if (items.length === 0) {
        toast({ title: "No changes to save" });
        setIsSaving(false);
        return;
      }

      await apiRequest("PUT", "/api/settings/batch", { items });
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      setEditedSettings({});
      toast({ title: "Settings saved successfully" });
    } catch (error) {
      toast({ title: getErrorMessage(error, "Failed to save settings"), variant: "destructive" });
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  const hasChanges = Object.keys(editedSettings).length > 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">Global Settings</h2>
          <p className="text-sm text-muted-foreground">Site-wide settings and branding.</p>
        </div>
        <Button onClick={saveAll} disabled={isSaving || !hasChanges} data-testid="button-save-settings">
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Branding</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Site Name</Label>
            <Input
              value={getValue("site_name", "Valuence VC")}
              onChange={(e) => handleChange("site_name", e.target.value)}
              data-testid="input-site-name"
            />
          </div>
          <div className="space-y-2">
            <Label>Tagline</Label>
            <Input
              value={getValue("site_tagline", "")}
              onChange={(e) => handleChange("site_tagline", e.target.value)}
              data-testid="input-site-tagline"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Footer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Copyright Text</Label>
            <Input
              value={getValue("footer_copyright", "")}
              onChange={(e) => handleChange("footer_copyright", e.target.value)}
              placeholder="Your Company Name"
              data-testid="input-footer-copyright"
            />
          </div>
          <div className="space-y-2">
            <Label>Footer Description</Label>
            <Textarea
              value={getValue("footer_description", "")}
              onChange={(e) => handleChange("footer_description", e.target.value)}
              rows={2}
              placeholder="Brief description of your company..."
              data-testid="input-footer-description"
            />
          </div>
          <div className="space-y-2">
            <Label>Location</Label>
            <Input
              value={getValue("footer_location", "")}
              onChange={(e) => handleChange("footer_location", e.target.value)}
              placeholder="e.g., North America & Asia"
              data-testid="input-footer-location"
            />
          </div>
          <div className="space-y-2">
            <Label>Contact Email</Label>
            <Input
              value={getValue("contact_email", "")}
              onChange={(e) => handleChange("contact_email", e.target.value)}
              placeholder="info@yourcompany.com"
              data-testid="input-contact-email"
            />
          </div>
          <div className="space-y-2">
            <Label>Newsletter Text</Label>
            <Input
              value={getValue("footer_newsletter_text", "")}
              onChange={(e) => handleChange("footer_newsletter_text", e.target.value)}
              placeholder="Stay updated on our latest investments and insights."
              data-testid="input-footer-newsletter-text"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Social Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>LinkedIn URL</Label>
            <Input
              value={getValue("social_linkedin", "")}
              onChange={(e) => handleChange("social_linkedin", e.target.value)}
              placeholder="https://linkedin.com/company/..."
              data-testid="input-social-linkedin"
            />
          </div>
          <div className="space-y-2">
            <Label>Twitter URL</Label>
            <Input
              value={getValue("social_twitter", "")}
              onChange={(e) => handleChange("social_twitter", e.target.value)}
              placeholder="https://twitter.com/..."
              data-testid="input-social-twitter"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AnalyticsSection() {
  const { data: stats, isLoading: statsLoading } = useQuery<any>({
    queryKey: ["/api/analytics/stats"],
  });

  const { data: views = [], isLoading: viewsLoading } = useQuery<any[]>({
    queryKey: ["/api/analytics/views"],
  });

  if (statsLoading || viewsLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  const chartData = stats?.topPaths?.map(([path, count]: [string, number]) => ({
    name: path,
    views: count,
  })) || [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Page Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalViews || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Unique Paths</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.topPaths?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Top Pages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="views" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {views.slice(0, 10).map((view, i) => (
              <div key={i} className="flex items-center justify-between border-b pb-2 last:border-0">
                <div>
                  <p className="font-medium">{view.path}</p>
                  <p className="text-xs text-muted-foreground">{view.userAgent || 'Unknown'}</p>
                </div>
                <div className="text-sm text-muted-foreground">
                  {new Date(view.timestamp * 1000).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Admin() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Admin Panel</CardTitle>
            <CardDescription>
              Please log in to access the admin panel.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const username = formData.get("username");
              const password = formData.get("password");
              try {
                const res = await apiRequest("POST", "/api/login", { username, password });
                window.location.reload();
              } catch (error) {
                toast({ title: "Login failed", variant: "destructive" });
              }
            }} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" name="username" placeholder="admin" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required />
              </div>
              <Button type="submit" className="w-full" data-testid="button-login">
                <LogOut className="mr-2 h-4 w-4" />
                Sign In
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                For local development, any username/password combination will work.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold" data-testid="text-admin-title">Admin Panel</h1>
            {user && (
              <span className="text-sm text-muted-foreground" data-testid="text-admin-user">
                Logged in as {user.firstName || user.email}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" asChild data-testid="button-view-site">
              <a href="/">View Site</a>
            </Button>
            <Button variant="outline" asChild data-testid="button-logout">
              <a href="/api/logout">
                <LogOut className="mr-2 h-4 w-4" />
                Log Out
              </a>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="pages" className="space-y-6">
          <TabsList className="flex flex-wrap gap-1">
            <TabsTrigger value="pages" className="flex items-center gap-2" data-testid="tab-pages">
              <LayoutDashboard className="h-4 w-4" />
              Pages
            </TabsTrigger>
            <TabsTrigger value="team" className="flex items-center gap-2" data-testid="tab-team">
              <Users className="h-4 w-4" />
              Team
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="flex items-center gap-2" data-testid="tab-portfolio">
              <Building2 className="h-4 w-4" />
              Portfolio
            </TabsTrigger>
            <TabsTrigger value="navigation" className="flex items-center gap-2" data-testid="tab-navigation">
              <Navigation className="h-4 w-4" />
              Navigation
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2" data-testid="tab-settings">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="media" className="flex items-center gap-2" data-testid="tab-media">
              <Image className="h-4 w-4" />
              Media
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2" data-testid="tab-analytics">
              <Activity className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pages">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LayoutDashboard className="h-5 w-5" />
                  Page Content
                </CardTitle>
                <CardDescription>
                  Edit the content sections on each page of your website.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PageContentSection />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Team Members
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TeamSection />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="portfolio">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Portfolio Companies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PortfolioSection />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="navigation">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="h-5 w-5" />
                  Navigation Links
                </CardTitle>
                <CardDescription>
                  Manage the links in your header and footer navigation menus.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <NavigationSection />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Global Settings
                </CardTitle>
                <CardDescription>
                  Configure site-wide settings, branding, and social links.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GlobalSettingsSection />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="media">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="h-5 w-5" />
                  Media Library
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MediaSection />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Website Analytics
                </CardTitle>
                <CardDescription>
                  Track page views and visitor activity.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AnalyticsSection />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

