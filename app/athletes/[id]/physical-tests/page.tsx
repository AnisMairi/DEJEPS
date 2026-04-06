"use client"

import React, { use, useEffect, useState } from "react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Layout } from "@/components/layout/layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import {
  getPhysicalRecord,
  savePhysicalRecord,
  type PhysicalSessionResults,
  type AthletePhysicalRecord,
} from "@/lib/demo-physical-tests"

const emptySession = (): PhysicalSessionResults => ({
  sfcodtSeconds: null,
  cmjCm: null,
  yoyoMeters: null,
  sprint10Seconds: null,
})

export default function PhysicalTestsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { toast } = useToast()
  const [athleteName, setAthleteName] = useState("")
  const [s1, setS1] = useState<PhysicalSessionResults>(emptySession())
  const [s2, setS2] = useState<PhysicalSessionResults>(emptySession())

  useEffect(() => {
    const load = async () => {
      const { DEMO_ATHLETES } = await import("@/lib/demo-athletes")
      const a = DEMO_ATHLETES.find((x) => x.id === id)
      if (a) setAthleteName(`${a.first_name} ${a.last_name}`)
      const rec = getPhysicalRecord(id)
      if (rec.session1) setS1(rec.session1)
      if (rec.session2) setS2(rec.session2)
    }
    load()
  }, [id])

  const patch =
    (session: 1 | 2) =>
    (field: keyof PhysicalSessionResults, raw: string) => {
      const num = raw === "" ? null : parseFloat(raw.replace(",", "."))
      if (session === 1) {
        setS1((prev) => ({ ...prev, [field]: num }))
      } else {
        setS2((prev) => ({ ...prev, [field]: num }))
      }
    }

  const save = (session: 1 | 2) => {
    const existing = getPhysicalRecord(id)
    savePhysicalRecord({
      athleteId: id,
      session1: session === 1 ? s1 : existing.session1,
      session2: session === 2 ? s2 : existing.session2,
    })
    toast({
      title: "Résultats enregistrés",
      description: session === 1 ? "Session juillet (détection) mise à jour." : "Session Toussaint (retest) mise à jour.",
    })
  }

  const fields: { key: keyof PhysicalSessionResults; label: string; unit: string; hint: string }[] = [
    { key: "sfcodtSeconds", label: "SFCODT", unit: "s", hint: "Temps (plus bas = mieux)" },
    { key: "cmjCm", label: "CMJ", unit: "cm", hint: "Hauteur de saut" },
    { key: "yoyoMeters", label: "Yo-Yo IR1", unit: "m", hint: "Distance" },
    { key: "sprint10Seconds", label: "Sprint 10 m", unit: "s", hint: "Temps (plus bas = mieux)" },
  ]

  return (
    <ProtectedRoute allowedRoles={["coach", "administrator"]}>
      <Layout>
        <div className="space-y-6 max-w-3xl">
          <div>
            <h1 className="text-3xl font-bold">Tests physiques (stage national)</h1>
            <p className="text-muted-foreground">
              Saisie réservée au staff du stage (Coach Principal) — {athleteName || "…"}
            </p>
          </div>

          <Tabs defaultValue="s1">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="s1">Session 1 — Stage juillet (détection)</TabsTrigger>
              <TabsTrigger value="s2">Session 2 — Toussaint (retest)</TabsTrigger>
            </TabsList>
            <TabsContent value="s1">
              <Card>
                <CardHeader>
                  <CardTitle>Session juillet</CardTitle>
                  <CardDescription>Première mesure nationale.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {fields.map((f) => (
                    <div key={f.key} className="space-y-2">
                      <Label>
                        {f.label} ({f.unit})
                      </Label>
                      <Input
                        type="text"
                        inputMode="decimal"
                        placeholder={f.hint}
                        value={s1[f.key] ?? ""}
                        onChange={(e) => patch(1)(f.key, e.target.value)}
                      />
                    </div>
                  ))}
                  <Button type="button" onClick={() => save(1)}>
                    Enregistrer la session juillet
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="s2">
              <Card>
                <CardHeader>
                  <CardTitle>Session Toussaint</CardTitle>
                  <CardDescription>Deuxième mesure — progression.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {fields.map((f) => (
                    <div key={f.key} className="space-y-2">
                      <Label>
                        {f.label} ({f.unit})
                      </Label>
                      <Input
                        type="text"
                        inputMode="decimal"
                        placeholder={f.hint}
                        value={s2[f.key] ?? ""}
                        onChange={(e) => patch(2)(f.key, e.target.value)}
                      />
                    </div>
                  ))}
                  <Button type="button" onClick={() => save(2)}>
                    Enregistrer la session Toussaint
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </Layout>
    </ProtectedRoute>
  )
}
