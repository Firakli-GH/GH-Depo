// ============================================================================
// OMNICHANNEL PAZARYERİ & ERP - WPF (XAML & C# MVVM) EKRAN ÜRETİM VERİTABANI
// Modern Windows 11 Fluent / Mica Dark Tema Standartları
// CommunityToolkit.Mvvm + .NET 8.0 WPF Mimarisi
// ============================================================================

export interface WpfScreenDefinition {
  id: string;
  title: string;
  category: 'Katalog & Ürün' | 'Sipariş & Kargo' | 'Müşteri & Finans' | 'Sistem & API' | 'Global Tema';
  description: string;
  xamlFileName: string;
  viewModelFileName: string;
  highlightFeatures: string[];
  xamlCode: string;
  viewModelCode: string;
  simulationType?: 'dashboard' | 'catalog' | 'dispatch' | 'orders' | 'cargo' | 'questions' | 'mapping' | 'stores' | 'theme';
}

export const WPF_GLOBAL_THEME_XAML = `<!-- ==========================================================================
     DOSYA: Themes/ModernDarkTheme.xaml
     AÇIKLAMA: Windows 11 Fluent Dark / Mica Renk Paleti ve Kontrol Şablonları
     ========================================================================== -->
<ResourceDictionary xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
                    xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml">

    <!-- Renk Paleti (Modern Fluent / Slate Palette) -->
    <Color x:Key="WindowBackground">#0B1120</Color>
    <Color x:Key="SurfaceBackground">#0F172A</Color>
    <Color x:Key="CardBackground">#1E293B</Color>
    <Color x:Key="BorderColor">#334155</Color>
    <Color x:Key="PrimaryAccent">#3B82F6</Color>
    <Color x:Key="PrimaryHover">#2563EB</Color>
    <Color x:Key="SuccessGreen">#10B981</Color>
    <Color x:Key="WarningAmber">#F59E0B</Color>
    <Color x:Key="DangerRed">#EF4444</Color>
    <Color x:Key="TextPrimary">#F8FAFC</Color>
    <Color x:Key="TextSecondary">#94A3B8</Color>
    <Color x:Key="TextMuted">#64748B</Color>

    <!-- Fırçalar (Brushes) -->
    <SolidColorBrush x:Key="WindowBackgroundBrush" Color="{StaticResource WindowBackground}" />
    <SolidColorBrush x:Key="SurfaceBackgroundBrush" Color="{StaticResource SurfaceBackground}" />
    <SolidColorBrush x:Key="CardBackgroundBrush" Color="{StaticResource CardBackground}" />
    <SolidColorBrush x:Key="BorderBrush" Color="{StaticResource BorderColor}" />
    <SolidColorBrush x:Key="PrimaryAccentBrush" Color="{StaticResource PrimaryAccent}" />
    <SolidColorBrush x:Key="PrimaryHoverBrush" Color="{StaticResource PrimaryHover}" />
    <SolidColorBrush x:Key="SuccessGreenBrush" Color="{StaticResource SuccessGreen}" />
    <SolidColorBrush x:Key="WarningAmberBrush" Color="{StaticResource WarningAmber}" />
    <SolidColorBrush x:Key="DangerRedBrush" Color="{StaticResource DangerRed}" />
    <SolidColorBrush x:Key="TextPrimaryBrush" Color="{StaticResource TextPrimary}" />
    <SolidColorBrush x:Key="TextSecondaryBrush" Color="{StaticResource TextSecondary}" />
    <SolidColorBrush x:Key="TextMutedBrush" Color="{StaticResource TextMuted}" />

    <!-- Modern Kart Stili (Card Border) -->
    <Style x:Key="ModernCardStyle" TargetType="Border">
        <Setter Property="Background" Value="{StaticResource SurfaceBackgroundBrush}" />
        <Setter Property="BorderBrush" Value="{StaticResource BorderBrush}" />
        <Setter Property="BorderThickness" Value="1" />
        <Setter Property="CornerRadius" Value="10" />
        <Setter Property="Padding" Value="16" />
        <Setter Property="SnapsToDevicePixels" Value="True" />
    </Style>

    <!-- Modern Buton Stili (Primary Fluent Button) -->
    <Style x:Key="ModernPrimaryButton" TargetType="Button">
        <Setter Property="Background" Value="{StaticResource PrimaryAccentBrush}" />
        <Setter Property="Foreground" Value="White" />
        <Setter Property="FontWeight" Value="SemiBold" />
        <Setter Property="FontSize" Value="13" />
        <Setter Property="Padding" Value="16,8" />
        <Setter Property="BorderThickness" Value="0" />
        <Setter Property="Cursor" Value="Hand" />
        <Setter Property="Template">
            <Setter.Value>
                <ControlTemplate TargetType="Button">
                    <Border x:Name="border" Background="{TemplateBinding Background}"
                            CornerRadius="8" Padding="{TemplateBinding Padding}">
                        <ContentPresenter HorizontalAlignment="Center" VerticalAlignment="Center"/>
                    </Border>
                    <ControlTemplate.Triggers>
                        <Trigger Property="IsMouseOver" Value="True">
                            <Setter TargetName="border" Property="Background" Value="{StaticResource PrimaryHoverBrush}" />
                        </Trigger>
                        <Trigger Property="IsEnabled" Value="False">
                            <Setter TargetName="border" Property="Opacity" Value="0.5" />
                        </Trigger>
                    </ControlTemplate.Triggers>
                </ControlTemplate>
            </Setter.Value>
        </Setter>
    </Style>

    <!-- Modern Excel Tipi DataGrid Stili -->
    <Style x:Key="FluentDataGridStyle" TargetType="DataGrid">
        <Setter Property="Background" Value="{StaticResource SurfaceBackgroundBrush}" />
        <Setter Property="Foreground" Value="{StaticResource TextPrimaryBrush}" />
        <Setter Property="BorderBrush" Value="{StaticResource BorderBrush}" />
        <Setter Property="BorderThickness" Value="1" />
        <Setter Property="RowBackground" Value="{StaticResource SurfaceBackgroundBrush}" />
        <Setter Property="AlternatingRowBackground" Value="#131D31" />
        <Setter Property="GridLinesVisibility" Value="Horizontal" />
        <Setter Property="HorizontalGridLinesBrush" Value="{StaticResource BorderBrush}" />
        <Setter Property="HeadersVisibility" Value="Column" />
        <Setter Property="RowHeight" Value="42" />
        <Setter Property="ColumnHeaderHeight" Value="40" />
        <Setter Property="CanUserAddRows" Value="False" />
        <Setter Property="CanUserDeleteRows" Value="False" />
        <Setter Property="AutoGenerateColumns" Value="False" />
        <Setter Property="SelectionMode" Value="Single" />
        <Setter Property="SelectionUnit" Value="FullRow" />
        <Setter Property="EnableRowVirtualization" Value="True" />
        <Setter Property="EnableColumnVirtualization" Value="True" />
    </Style>

    <!-- DataGrid Başlık Stili -->
    <Style TargetType="DataGridColumnHeader">
        <Setter Property="Background" Value="#090E17" />
        <Setter Property="Foreground" Value="{StaticResource TextSecondaryBrush}" />
        <Setter Property="FontWeight" Value="SemiBold" />
        <Setter Property="FontSize" Value="12" />
        <Setter Property="Padding" Value="12,0" />
        <Setter Property="BorderBrush" Value="{StaticResource BorderBrush}" />
        <Setter Property="BorderThickness" Value="0,0,1,1" />
    </Style>
</ResourceDictionary>`;

export const WPF_SCREENS: WpfScreenDefinition[] = [
  // 1. DASHBOARD (KOKPİT)
  {
    id: 'dashboard',
    title: 'Genel Bakış (Kokpit & Metrikler)',
    category: 'Katalog & Ürün',
    description: 'KPI metrik kartları, kanal bazlı ciro dağılımı, kritik stok ve SLA gecikme uyarıları içeren ana kokpit ekranı.',
    xamlFileName: 'Views/DashboardView.xaml',
    viewModelFileName: 'ViewModels/DashboardViewModel.cs',
    highlightFeatures: [
      'Fluent Grid layout ile 4 sütunlu KPI metrik kartları',
      'Pazaryeri kanal bazlı ciro progress barları (Trendyol, HB, Pazarama)',
      'SLA süresi dolmak üzere olan acil siparişler DataGrid',
      'CommunityToolkit.Mvvm asenkron veri yükleme'
    ],
    xamlCode: `<UserControl x:Class="OmniChannel.Wpf.Views.DashboardView"
             xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
             xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
             xmlns:d="http://schemas.microsoft.com/expression/blend/2008"
             xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
             xmlns:vm="clr-namespace:OmniChannel.Wpf.ViewModels"
             mc:Ignorable="d" d:DesignHeight="900" d:DesignWidth="1400"
             Background="{StaticResource WindowBackgroundBrush}">

    <UserControl.DataContext>
        <vm:DashboardViewModel />
    </UserControl.DataContext>

    <ScrollViewer VerticalScrollBarVisibility="Auto">
        <Grid Margin="24">
            <Grid.RowDefinitions>
                <RowDefinition Height="Auto"/> <!-- Üst Başlık & Senkronizasyon Butonu -->
                <RowDefinition Height="Auto"/> <!-- KPI Metrik Kartları (4 Adet) -->
                <RowDefinition Height="*"/>    <!-- Kanal Dağılımı & Acil Sipariş Tablosu -->
            </Grid.RowDefinitions>

            <!-- 1. ÜST BAŞLIK VE HIZLI AKSİYONLAR -->
            <Grid Grid.Row="0" Margin="0,0,0,20">
                <Grid.ColumnDefinitions>
                    <ColumnDefinition Width="*"/>
                    <ColumnDefinition Width="Auto"/>
                </Grid.ColumnDefinitions>
                <StackPanel Orientation="Vertical">
                    <TextBlock Text="Genel Bakış · Entegre Yönetim Kokpiti" 
                               FontSize="22" FontWeight="Bold" Foreground="{StaticResource TextPrimaryBrush}"/>
                    <TextBlock Text="Tüm pazaryerlerinin canlı satış, stok, SLA ve kargo mutabakat durumu" 
                               FontSize="13" Foreground="{StaticResource TextSecondaryBrush}" Margin="0,4,0,0"/>
                </StackPanel>
                <StackPanel Grid.Column="1" Orientation="Horizontal" VerticalAlignment="Center">
                    <Button Content="⟳ Şimdi Senkronize Et" Style="{StaticResource ModernPrimaryButton}"
                            Command="{Binding RefreshDashboardCommand}" Padding="16,10"/>
                </StackPanel>
            </Grid>

            <!-- 2. KPI METRİK KARTLARI (GRID 4 SÜTUN) -->
            <Grid Grid.Row="1" Margin="0,0,0,24">
                <Grid.ColumnDefinitions>
                    <ColumnDefinition Width="*"/>
                    <ColumnDefinition Width="*"/>
                    <ColumnDefinition Width="*"/>
                    <ColumnDefinition Width="*"/>
                </Grid.ColumnDefinitions>

                <!-- Kart 1: Toplam Sipariş -->
                <Border Grid.Column="0" Style="{StaticResource ModernCardStyle}" Margin="0,0,12,0">
                    <StackPanel>
                        <TextBlock Text="GÜNLÜK YENİ SİPARİŞ" FontSize="11" FontWeight="SemiBold" Foreground="{StaticResource TextMutedBrush}"/>
                        <TextBlock Text="{Binding TodayOrdersCount, StringFormat='{}{0} Adet'}" 
                                   FontSize="26" FontWeight="Bold" Foreground="{StaticResource TextPrimaryBrush}" Margin="0,8,0,4"/>
                        <TextBlock Text="↑ %14.2 düne göre artış" FontSize="11" Foreground="{StaticResource SuccessGreenBrush}"/>
                    </StackPanel>
                </Border>

                <!-- Kart 2: Toplam Ciro -->
                <Border Grid.Column="1" Style="{StaticResource ModernCardStyle}" Margin="6,0,6,0">
                    <StackPanel>
                        <TextBlock Text="GÜNLÜK BRÜT CİRO" FontSize="11" FontWeight="SemiBold" Foreground="{StaticResource TextMutedBrush}"/>
                        <TextBlock Text="{Binding TodayRevenue, StringFormat='{}{0:N2} ₺'}" 
                                   FontSize="26" FontWeight="Bold" Foreground="{StaticResource PrimaryAccentBrush}" Margin="0,8,0,4"/>
                        <TextBlock Text="8 mağaza ve tüm kanallar dahil" FontSize="11" Foreground="{StaticResource TextSecondaryBrush}"/>
                    </StackPanel>
                </Border>

                <!-- Kart 3: SLA Uyarıları -->
                <Border Grid.Column="2" Style="{StaticResource ModernCardStyle}" Margin="6,0,6,0">
                    <StackPanel>
                        <TextBlock Text="KRİTİK KARGO SLA" FontSize="11" FontWeight="SemiBold" Foreground="{StaticResource WarningAmberBrush}"/>
                        <TextBlock Text="{Binding UrgentSlaCount, StringFormat='{}{0} Sipariş'}" 
                                   FontSize="26" FontWeight="Bold" Foreground="{StaticResource WarningAmberBrush}" Margin="0,8,0,4"/>
                        <TextBlock Text="Bugün 16:00'a kadar kargolanmalı" FontSize="11" Foreground="{StaticResource TextSecondaryBrush}"/>
                    </StackPanel>
                </Border>

                <!-- Kart 4: Bekleyen Müşteri Soruları -->
                <Border Grid.Column="3" Style="{StaticResource ModernCardStyle}" Margin="12,0,0,0">
                    <StackPanel>
                        <TextBlock Text="BEKLEYEN MÜŞTERİ SORUSU" FontSize="11" FontWeight="SemiBold" Foreground="{StaticResource TextMutedBrush}"/>
                        <TextBlock Text="{Binding PendingQuestionsCount, StringFormat='{}{0} Soru'}" 
                                   FontSize="26" FontWeight="Bold" Foreground="{StaticResource TextPrimaryBrush}" Margin="0,8,0,4"/>
                        <TextBlock Text="Ortalama yanıt süresi: 18 dk" FontSize="11" Foreground="{StaticResource SuccessGreenBrush}"/>
                    </StackPanel>
                </Border>
            </Grid>

            <!-- 3. KANAL BAZLI CİRO VE ACİL SİPARİŞ LİSTESİ -->
            <Grid Grid.Row="2">
                <Grid.ColumnDefinitions>
                    <ColumnDefinition Width="2*"/>
                    <ColumnDefinition Width="3*"/>
                </Grid.ColumnDefinitions>

                <!-- Sol: Pazaryeri Kanal Dağılımı -->
                <Border Grid.Column="0" Style="{StaticResource ModernCardStyle}" Margin="0,0,12,0">
                    <DockPanel>
                        <TextBlock DockPanel.Dock="Top" Text="Pazaryeri Ciro Dağılımı" 
                                   FontSize="15" FontWeight="Bold" Foreground="{StaticResource TextPrimaryBrush}" Margin="0,0,0,16"/>
                        <ItemsControl ItemsSource="{Binding ChannelPerformances}">
                            <ItemsControl.ItemTemplate>
                                <DataTemplate>
                                    <Border Margin="0,0,0,12" Background="#111B2E" Padding="12" CornerRadius="8">
                                        <Grid>
                                            <Grid.RowDefinitions>
                                                <RowDefinition Height="Auto"/>
                                                <RowDefinition Height="Auto"/>
                                            </Grid.RowDefinitions>
                                            <Grid.ColumnDefinitions>
                                                <ColumnDefinition Width="*"/>
                                                <ColumnDefinition Width="Auto"/>
                                            </Grid.ColumnDefinitions>
                                            <TextBlock Text="{Binding ChannelName}" FontWeight="SemiBold" Foreground="{StaticResource TextPrimaryBrush}"/>
                                            <TextBlock Grid.Column="1" Text="{Binding Revenue, StringFormat='{}{0:N2} ₺'}" 
                                                       FontWeight="Bold" Foreground="{StaticResource PrimaryAccentBrush}"/>
                                            <ProgressBar Grid.Row="1" Grid.ColumnSpan="2" Height="6" Margin="0,8,0,0"
                                                         Value="{Binding Percentage}" Maximum="100" 
                                                         Foreground="{StaticResource PrimaryAccentBrush}" Background="#1E293B"/>
                                        </Grid>
                                    </Border>
                                </DataTemplate>
                            </ItemsControl.ItemTemplate>
                        </ItemsControl>
                    </DockPanel>
                </Border>

                <!-- Sağ: Acil Sevk Bekleyen Siparişler DataGrid -->
                <Border Grid.Column="1" Style="{StaticResource ModernCardStyle}" Margin="12,0,0,0">
                    <DockPanel>
                        <TextBlock DockPanel.Dock="Top" Text="Acil Sevk Bekleyen Siparişler (SLA Öncelikli)" 
                                   FontSize="15" FontWeight="Bold" Foreground="{StaticResource TextPrimaryBrush}" Margin="0,0,0,16"/>
                        <DataGrid Style="{StaticResource FluentDataGridStyle}" ItemsSource="{Binding UrgentOrders}">
                            <DataGrid.Columns>
                                <DataGridTextColumn Header="Sipariş No" Binding="{Binding OrderNumber}" Width="140"/>
                                <DataGridTextColumn Header="Kanal" Binding="{Binding Channel}" Width="100"/>
                                <DataGridTextColumn Header="Müşteri" Binding="{Binding CustomerName}" Width="*"/>
                                <DataGridTextColumn Header="Tutar" Binding="{Binding TotalAmount, StringFormat='{}{0:N2} ₺'}" Width="110"/>
                                <DataGridTextColumn Header="Kalan Süre" Binding="{Binding RemainingTimeText}" Width="120"/>
                            </DataGrid.Columns>
                        </DataGrid>
                    </DockPanel>
                </Border>
            </Grid>
        </Grid>
    </ScrollViewer>
</UserControl>`,
    viewModelCode: `using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using System.Collections.ObjectModel;

namespace OmniChannel.Wpf.ViewModels;

public partial class DashboardViewModel : ObservableObject
{
    [ObservableProperty]
    private int todayOrdersCount = 142;

    [ObservableProperty]
    private decimal todayRevenue = 48750.80m;

    [ObservableProperty]
    private int urgentSlaCount = 6;

    [ObservableProperty]
    private int pendingQuestionsCount = 3;

    public ObservableCollection<ChannelPerformanceDto> ChannelPerformances { get; } = new();
    public ObservableCollection<UrgentOrderDto> UrgentOrders { get; } = new();

    public DashboardViewModel()
    {
        LoadMockData();
    }

    [RelayCommand]
    private async Task RefreshDashboardAsync()
    {
        // Canlı pazaryeri API worker senkronizasyonu
        await Task.Delay(400);
        TodayOrdersCount += 1;
        TodayRevenue += 850m;
    }

    private void LoadMockData()
    {
        ChannelPerformances.Add(new("Trendyol", 24350.50m, 50));
        ChannelPerformances.Add(new("Hepsiburada", 15200.00m, 31));
        ChannelPerformances.Add(new("Amazon TR", 6400.30m, 13));
        ChannelPerformances.Add(new("Pazarama / N11", 2800.00m, 6));

        UrgentOrders.Add(new("TY-8941209", "Trendyol", "Mehmet Yılmaz", 749.90m, "1 Sa 45 Dk"));
        UrgentOrders.Add(new("HB-6091823", "Hepsiburada", "Ayşe Kaya", 1250.00m, "2 Sa 10 Dk"));
        UrgentOrders.Add(new("AMZ-309-84", "Amazon TR", "Serdar Aydın", 420.00m, "3 Sa 05 Dk"));
    }
}

public record ChannelPerformanceDto(string ChannelName, decimal Revenue, double Percentage);
public record UrgentOrderDto(string OrderNumber, string Channel, string CustomerName, decimal TotalAmount, string RemainingTimeText);`
  },

  // 2. ANA ÜRÜN KATALOĞU & BOM (MAIN PRODUCT CATALOG)
  {
    id: 'catalog',
    title: 'Ana Ürün Kataloğu & BOM Reçete Masası',
    category: 'Katalog & Ürün',
    description: '3 Kademeli ürün mimarisi: Fiziki Depo Stoğu -> Ana Ürün (BOM Reçetesi) -> Pazaryeri Klon İlanları (1:N). Hızlı Excel tipi DataGrid ve ContextMenu.',
    xamlFileName: 'Views/MainProductCatalogView.xaml',
    viewModelFileName: 'ViewModels/MainProductCatalogViewModel.cs',
    highlightFeatures: [
      'Master Barcode ve Sanal Stok otomatik hesaplama',
      'RowDetailsTemplate ile ürünün BOM (Reçete) hammadde bileşenlerini gösterme',
      'Sağ tık ContextMenu ile "Pazaryerine Gönder" ve "Klon İlan Aç" tetikleme',
      'Kanal rozetleri (Trendyol, HB, Amazon, Çiçeksepeti)'
    ],
    xamlCode: `<UserControl x:Class="OmniChannel.Wpf.Views.MainProductCatalogView"
             xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
             xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
             xmlns:vm="clr-namespace:OmniChannel.Wpf.ViewModels"
             Background="{StaticResource WindowBackgroundBrush}">

    <UserControl.DataContext>
        <vm:MainProductCatalogViewModel />
    </UserControl.DataContext>

    <Grid Margin="24">
        <Grid.RowDefinitions>
            <RowDefinition Height="Auto"/> <!-- Başlık ve ERP Bilgi Şeridi -->
            <RowDefinition Height="Auto"/> <!-- Arama ve Filtreleme Araç Çubuğu -->
            <RowDefinition Height="*"/>    <!-- Excel Tipi Yüksek Hızlı DataGrid -->
        </Grid.RowDefinitions>

        <!-- 1. ÜST BAŞLIK -->
        <Grid Grid.Row="0" Margin="0,0,0,16">
            <Grid.ColumnDefinitions>
                <ColumnDefinition Width="*"/>
                <ColumnDefinition Width="Auto"/>
            </Grid.ColumnDefinitions>
            <StackPanel>
                <TextBlock Text="Ana Ürün Kataloğu & BOM Reçete Matrisi" 
                           FontSize="22" FontWeight="Bold" Foreground="{StaticResource TextPrimaryBrush}"/>
                <TextBlock Text="1 Merkezi Ürün $\rightarrow$ Çoklu BOM Reçetesi $\rightarrow$ Sınırsız Pazaryeri Klon İlanı (1:N Senkronizasyon)" 
                           FontSize="13" Foreground="{StaticResource TextSecondaryBrush}" Margin="0,4,0,0"/>
            </StackPanel>
            <StackPanel Grid.Column="1" Orientation="Horizontal">
                <Button Content="+ Yeni Ana Ürün & Reçete Tanımla" 
                        Style="{StaticResource ModernPrimaryButton}"
                        Command="{Binding AddNewProductCommand}"/>
            </StackPanel>
        </Grid>

        <!-- 2. ARAMA VE FİLTRELEME ÇUBUĞU -->
        <Border Grid.Row="1" Style="{StaticResource ModernCardStyle}" Padding="12" Margin="0,0,0,16">
            <Grid>
                <Grid.ColumnDefinitions>
                    <ColumnDefinition Width="320"/>
                    <ColumnDefinition Width="*"/>
                    <ColumnDefinition Width="Auto"/>
                </Grid.ColumnDefinitions>
                
                <TextBox Text="{Binding SearchKeyword, UpdateSourceTrigger=PropertyChanged}" 
                         Padding="10,6" Background="#0B1120" Foreground="{StaticResource TextPrimaryBrush}"
                         BorderBrush="{StaticResource BorderBrush}" BorderThickness="1"
                         VerticalAlignment="Center"/>

                <StackPanel Grid.Column="2" Orientation="Horizontal" VerticalAlignment="Center">
                    <Button Content="Pazaryerine Aç (Seçilenler)" 
                            Style="{StaticResource ModernPrimaryButton}" Margin="0,0,8,0"
                            Command="{Binding OpenDispatchWizardCommand}"/>
                    <Button Content="Excel / CSV Dışa Aktar" 
                            Background="#1E293B" Foreground="{StaticResource TextPrimaryBrush}"
                            Padding="12,8" BorderThickness="1" BorderBrush="{StaticResource BorderBrush}"/>
                </StackPanel>
            </Grid>
        </Border>

        <!-- 3. EXCEL HIZINDA DATAGRID & DETAY BOM REÇETESİ -->
        <DataGrid Grid.Row="2" Style="{StaticResource FluentDataGridStyle}"
                  ItemsSource="{Binding FilteredProducts}"
                  SelectedItem="{Binding SelectedProduct}">
            <DataGrid.ContextMenu>
                <ContextMenu Background="#0F172A" Foreground="#F8FAFC">
                    <MenuItem Header="Pazaryerine Gönder (Trendyol)" Command="{Binding DispatchToChannelCommand}" CommandParameter="trendyol"/>
                    <MenuItem Header="Pazaryerine Gönder (Hepsiburada)" Command="{Binding DispatchToChannelCommand}" CommandParameter="hepsiburada"/>
                    <MenuItem Header="Yeni Klon İlan Türet" Command="{Binding CloneListingCommand}"/>
                    <Separator Background="#334155"/>
                    <MenuItem Header="BOM Reçetesini Düzenle" Command="{Binding EditBomRecipeCommand}"/>
                </ContextMenu>
            </DataGrid.ContextMenu>

            <DataGrid.Columns>
                <DataGridTextColumn Header="Ana Ürün Kodu" Binding="{Binding MasterProductCode}" Width="140" FontWeight="SemiBold"/>
                <DataGridTextColumn Header="Merkezi Barkod" Binding="{Binding MasterBarcode}" Width="150" FontFamily="Consolas"/>
                <DataGridTextColumn Header="Ürün Başlığı" Binding="{Binding Title}" Width="*"/>
                <DataGridTextColumn Header="Hesaplanan Stok" Binding="{Binding CalculatedStock}" Width="120" FontWeight="Bold"/>
                <DataGridTextColumn Header="BOM Maliyeti" Binding="{Binding TotalCost, StringFormat='{}{0:N2} ₺'}" Width="110"/>
                <DataGridTextColumn Header="Aktif İlan Sayısı" Binding="{Binding ActiveListingsCount}" Width="120"/>
            </DataGrid.Columns>

            <!-- Satır Tıklanınca Açılan Reçete (BOM) Şablonu -->
            <DataGrid.RowDetailsTemplate>
                <DataTemplate>
                    <Border Background="#090E17" BorderBrush="{StaticResource BorderBrush}" 
                            BorderThickness="0,1,0,1" Padding="16">
                        <StackPanel>
                            <TextBlock Text="📦 BOM Reçetesi (Fiziki Depo Hammadde Bileşenleri):" 
                                       FontWeight="Bold" Foreground="{StaticResource PrimaryAccentBrush}" Margin="0,0,0,8"/>
                            <ItemsControl ItemsSource="{Binding RecipeItems}">
                                <ItemsControl.ItemTemplate>
                                    <DataTemplate>
                                        <TextBlock Foreground="{StaticResource TextSecondaryBrush}" Margin="0,2">
                                            <Run Text="• " Foreground="{StaticResource PrimaryAccentBrush}"/>
                                            <Run Text="{Binding InventoryItemTitle}"/>
                                            <Run Text=" - Adet: "/>
                                            <Run Text="{Binding QuantityRequired}" FontWeight="Bold" Foreground="{StaticResource TextPrimaryBrush}"/>
                                            <Run Text=" | Birim Maliyet: "/>
                                            <Run Text="{Binding UnitCost, StringFormat='{}{0:N2} ₺'}"/>
                                        </TextBlock>
                                    </DataTemplate>
                                </ItemsControl.ItemTemplate>
                            </ItemsControl>
                        </StackPanel>
                    </Border>
                </DataTemplate>
            </DataGrid.RowDetailsTemplate>
        </DataGrid>
    </Grid>
</UserControl>`,
    viewModelCode: `using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using System.Collections.ObjectModel;

namespace OmniChannel.Wpf.ViewModels;

public partial class MainProductCatalogViewModel : ObservableObject
{
    [ObservableProperty]
    private string searchKeyword = string.Empty;

    [ObservableProperty]
    private MainProductDto? selectedProduct;

    public ObservableCollection<MainProductDto> Products { get; } = new();
    public ObservableCollection<MainProductDto> FilteredProducts { get; } = new();

    public MainProductCatalogViewModel()
    {
        LoadSampleCatalog();
    }

    [RelayCommand]
    private void AddNewProduct()
    {
        // Yeni ürün ve BOM reçete sihirbazı modalı
    }

    [RelayCommand]
    private void OpenDispatchWizard()
    {
        // Pazaryerine ürün açma sihirbazı
    }

    [RelayCommand]
    private void DispatchToChannel(string channel)
    {
        // Seçilen kanala direkt aktarım
    }

    private void LoadSampleCatalog()
    {
        var prod1 = new MainProductDto(
            "MP-KOLON-80", 
            "8690123456789", 
            "80 Derece Limon Kolonyası 1000ml (Cam Şişe)", 
            150, 
            38.50m, 
            4
        );
        prod1.RecipeItems.Add(new("1000ml Cam Şişe", 1, 14.00m));
        prod1.RecipeItems.Add(new("Saf Alkol & Esans (1000ml)", 1, 22.00m));
        prod1.RecipeItems.Add(new("Emniyetli Kapak & Etiket", 1, 2.50m));

        var prod2 = new MainProductDto(
            "MP-SET-HYG", 
            "8690987654321", 
            "Avantajlı Aile Hijyen Paketi (4x Kolonya + Dezenfektan)", 
            75, 
            145.00m, 
            6
        );

        Products.Add(prod1);
        Products.Add(prod2);
        FilteredProducts.Add(prod1);
        FilteredProducts.Add(prod2);
    }
}

public class MainProductDto
{
    public string MasterProductCode { get; set; }
    public string MasterBarcode { get; set; }
    public string Title { get; set; }
    public int CalculatedStock { get; set; }
    public decimal TotalCost { get; set; }
    public int ActiveListingsCount { get; set; }
    public ObservableCollection<RecipeItemDto> RecipeItems { get; } = new();

    public MainProductDto(string code, string barcode, string title, int stock, decimal cost, int listings)
    {
        MasterProductCode = code;
        MasterBarcode = barcode;
        Title = title;
        CalculatedStock = stock;
        TotalCost = cost;
        ActiveListingsCount = listings;
    }
}

public record RecipeItemDto(string InventoryItemTitle, int QuantityRequired, decimal UnitCost);`
  },

  // 3. PAZARYERİNE ÜRÜN AÇMA MOTORU & SİHİRBAZI (PRODUCT DISPATCH MODAL)
  {
    id: 'dispatch',
    title: 'Pazaryerine Ürün Açma & Nitelik Sihirbazı',
    category: 'Katalog & Ürün',
    description: 'Pazaryeri API gereksinimlerine göre kategori eşleme, marka kontrolü, zorunlu dinamik nitelikler (attributes) ve giden JSON payload önizlemesi.',
    xamlFileName: 'Views/ProductDispatchDialog.xaml',
    viewModelFileName: 'ViewModels/ProductDispatchViewModel.cs',
    highlightFeatures: [
      'Pazaryeri Kanal Sekmeleri (Trendyol, Hepsiburada, Pazarama, N11)',
      'Eksik zorunlu nitelikler için dinamik ItemsControl ve ComboBox editörleri',
      'Canlı HTTP REST Payload (JSON) önizleme sekmesi',
      'Arka plan asenkron aktarım ve Batch ID raporlama'
    ],
    xamlCode: `<Window x:Class="OmniChannel.Wpf.Views.ProductDispatchDialog"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        xmlns:vm="clr-namespace:OmniChannel.Wpf.ViewModels"
        Title="Pazaryerine Ürün Açma & Nitelik Sihirbazı" 
        Height="780" Width="1050" WindowStartupLocation="CenterOwner"
        Background="{StaticResource WindowBackgroundBrush}">

    <Window.DataContext>
        <vm:ProductDispatchViewModel />
    </Window.DataContext>

    <Grid Margin="20">
        <Grid.RowDefinitions>
            <RowDefinition Height="Auto"/> <!-- Üst Başlık & Hedef Kanal Seçimi -->
            <RowDefinition Height="*"/>    <!-- Nitelik Masası / JSON Önizleme Sekmeleri -->
            <RowDefinition Height="Auto"/> <!-- Alt Eylem Çubuğu (Gönder / Vazgeç) -->
        </Grid.RowDefinitions>

        <!-- 1. ÜST BAŞLIK VE HEDEF KANAL -->
        <Border Grid.Row="0" Style="{StaticResource ModernCardStyle}" Margin="0,0,0,16" Padding="14">
            <Grid>
                <Grid.ColumnDefinitions>
                    <ColumnDefinition Width="*"/>
                    <ColumnDefinition Width="Auto"/>
                </Grid.ColumnDefinitions>
                <StackPanel>
                    <TextBlock Text="Pazaryerine Ürün Açma & Aktarım Motoru" 
                               FontSize="18" FontWeight="Bold" Foreground="{StaticResource TextPrimaryBrush}"/>
                    <TextBlock Text="Kategori eşleşmesi, marka doğrulaması ve pazaryerinin beklediği zorunlu teknik nitelikler" 
                               FontSize="12" Foreground="{StaticResource TextSecondaryBrush}" Margin="0,4,0,0"/>
                </StackPanel>
                <StackPanel Grid.Column="1" Orientation="Horizontal" VerticalAlignment="Center">
                    <TextBlock Text="Hedef Kanal: " Foreground="{StaticResource TextSecondaryBrush}" VerticalAlignment="Center" Margin="0,0,8,0"/>
                    <ComboBox ItemsSource="{Binding AvailableChannels}" SelectedItem="{Binding SelectedChannel}"
                              Width="160" Height="34" Background="#0B1120" Foreground="{StaticResource TextPrimaryBrush}"/>
                </StackPanel>
            </Grid>
        </Border>

        <!-- 2. TAB CONTROL: NİTELİK FORMU VE GİDEN JSON PAYLOAD -->
        <TabControl Grid.Row="1" Background="{StaticResource SurfaceBackgroundBrush}" BorderBrush="{StaticResource BorderBrush}">
            <TabItem Header="Ürünler ve Zorunlu Nitelikler" Foreground="{StaticResource TextPrimaryBrush}">
                <ScrollViewer VerticalScrollBarVisibility="Auto" Margin="12">
                    <ItemsControl ItemsSource="{Binding ProductsToDispatch}">
                        <ItemsControl.ItemTemplate>
                            <DataTemplate>
                                <Border Style="{StaticResource ModernCardStyle}" Margin="0,0,0,12" Background="#111B2E">
                                    <StackPanel>
                                        <Grid Margin="0,0,0,10">
                                            <Grid.ColumnDefinitions>
                                                <ColumnDefinition Width="*"/>
                                                <ColumnDefinition Width="Auto"/>
                                            </Grid.ColumnDefinitions>
                                            <StackPanel>
                                                <TextBlock Text="{Binding Title}" FontSize="14" FontWeight="Bold" Foreground="{StaticResource TextPrimaryBrush}"/>
                                                <TextBlock Text="{Binding Barcode, StringFormat='Barkod: {0}'}" FontSize="12" Foreground="{StaticResource TextSecondaryBrush}"/>
                                            </StackPanel>
                                            <TextBlock Grid.Column="1" Text="Yayına Hazır (%100)" Foreground="{StaticResource SuccessGreenBrush}" FontWeight="Bold"/>
                                        </Grid>

                                        <!-- Zorunlu Nitelik Girişleri -->
                                        <TextBlock Text="Zorunlu Pazaryeri Nitelikleri:" FontWeight="SemiBold" Foreground="{StaticResource WarningAmberBrush}" Margin="0,4,0,6"/>
                                        <UniformGrid Columns="3">
                                            <StackPanel Margin="0,0,8,0">
                                                <TextBlock Text="Hacim / Ebat *" FontSize="11" Foreground="{StaticResource TextSecondaryBrush}"/>
                                                <TextBox Text="{Binding VolumeAttr}" Background="#0B1120" Foreground="{StaticResource TextPrimaryBrush}" Margin="0,2,0,0" Padding="6"/>
                                            </StackPanel>
                                            <StackPanel Margin="4,0,4,0">
                                                <TextBlock Text="Koku Türü *" FontSize="11" Foreground="{StaticResource TextSecondaryBrush}"/>
                                                <TextBox Text="{Binding ScentAttr}" Background="#0B1120" Foreground="{StaticResource TextPrimaryBrush}" Margin="0,2,0,0" Padding="6"/>
                                            </StackPanel>
                                            <StackPanel Margin="8,0,0,0">
                                                <TextBlock Text="Garanti Süresi *" FontSize="11" Foreground="{StaticResource TextSecondaryBrush}"/>
                                                <TextBox Text="{Binding WarrantyAttr}" Background="#0B1120" Foreground="{StaticResource TextPrimaryBrush}" Margin="0,2,0,0" Padding="6"/>
                                            </StackPanel>
                                        </UniformGrid>
                                    </StackPanel>
                                </Border>
                            </DataTemplate>
                        </ItemsControl.ItemTemplate>
                    </ItemsControl>
                </ScrollViewer>
            </TabItem>

            <TabItem Header="Giden API JSON Gövdesi (Payload)" Foreground="{StaticResource TextPrimaryBrush}">
                <TextBox Text="{Binding GeneratedJsonPayload}" IsReadOnly="True"
                         FontFamily="Consolas" FontSize="12" Background="#090E17" Foreground="#38BDF8"
                         BorderThickness="0" Padding="16" VerticalScrollBarVisibility="Auto"/>
            </TabItem>
        </TabControl>

        <!-- 3. ALT EYLEM BUTONLARI -->
        <Border Grid.Row="2" Margin="0,16,0,0">
            <Grid>
                <TextBlock Text="{Binding StatusMessage}" VerticalAlignment="Center" 
                           Foreground="{StaticResource TextSecondaryBrush}"/>
                <StackPanel HorizontalAlignment="Right" Orientation="Horizontal">
                    <Button Content="Vazgeç" Background="#1E293B" Foreground="{StaticResource TextPrimaryBrush}"
                            Padding="16,8" Margin="0,0,8,0"/>
                    <Button Content="Pazaryerine Aktarımı Başlat" 
                            Style="{StaticResource ModernPrimaryButton}"
                            Command="{Binding ExecuteBatchDispatchCommand}"/>
                </StackPanel>
            </Grid>
        </Border>
    </Grid>
</Window>`,
    viewModelCode: `using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using System.Collections.ObjectModel;

namespace OmniChannel.Wpf.ViewModels;

public partial class ProductDispatchViewModel : ObservableObject
{
    [ObservableProperty]
    private string selectedChannel = "Trendyol";

    [ObservableProperty]
    private string statusMessage = "1 Ürün seçildi. Zorunlu nitelikler doğrulandı.";

    [ObservableProperty]
    private string generatedJsonPayload = @"{
  ""items"": [
    {
      ""barcode"": ""8690123456789"",
      ""title"": ""80 Derece Limon Kolonyası 1000ml"",
      ""productMainId"": ""TY-SKU-MP-KOLON-80"",
      ""brandId"": 10294,
      ""categoryId"": 412,
      ""quantity"": 150,
      ""salePrice"": 55.80,
      ""vatRate"": 20,
      ""attributes"": [
        { ""attributeId"": 338, ""customAttributeValue"": ""1000 ml"" },
        { ""attributeId"": 1054, ""customAttributeValue"": ""Limon"" }
      ]
    }
  ]
}";

    public ObservableCollection<string> AvailableChannels { get; } = new() 
    { 
        "Trendyol", "Hepsiburada", "Amazon TR", "Pazarama", "N11" 
    };

    public ObservableCollection<DispatchProductItemDto> ProductsToDispatch { get; } = new();

    public ProductDispatchViewModel()
    {
        ProductsToDispatch.Add(new(
            "80 Derece Limon Kolonyası 1000ml", 
            "8690123456789", 
            "1000 ml", 
            "Limon", 
            "24 Ay"
        ));
    }

    [RelayCommand]
    private async Task ExecuteBatchDispatchAsync()
    {
        StatusMessage = "Pazaryeri API'sine iletiliyor...";
        await Task.Delay(800);
        StatusMessage = "Başarılı! Batch ID: BATCH-891402 onaylandı.";
    }
}

public record DispatchProductItemDto(string Title, string Barcode, string VolumeAttr, string ScentAttr, string WarrantyAttr);`
  },

  // 4. SİPARİŞ YÖNETİMİ & PAKETLEME (ORDERS VIEW)
  {
    id: 'orders',
    title: 'Sipariş Yönetimi & Barkodlu Paketleme',
    category: 'Sipariş & Kargo',
    description: 'Statü sekmeleri (Bekleyen, Toplama, Faturalandı, Kargolandı), barkod okuyucuyla hızlı paket doğrulama ve Logo/Netsis ERP fiş no aktarımı.',
    xamlFileName: 'Views/OrdersView.xaml',
    viewModelFileName: 'ViewModels/OrdersViewModel.cs',
    highlightFeatures: [
      'Statüye göre renklendirilmiş rozetler (Yeni, Hazırlanıyor, Kargolandı)',
      'Barkod Okuyucu Seri Arama Kutusu (El terminali entegrasyonu)',
      'ERP Fiş No Giriş ve Doğrulama Butonları',
      'Kargo Sağlayıcısı (Yurtiçi, Aras, HepsiJet, Trendyol Express) değiştirme'
    ],
    xamlCode: `<UserControl x:Class="OmniChannel.Wpf.Views.OrdersView"
             xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
             xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
             xmlns:vm="clr-namespace:OmniChannel.Wpf.ViewModels"
             Background="{StaticResource WindowBackgroundBrush}">

    <UserControl.DataContext>
        <vm:OrdersViewModel />
    </UserControl.DataContext>

    <Grid Margin="24">
        <Grid.RowDefinitions>
            <RowDefinition Height="Auto"/> <!-- Üst Filtreler & El Terminali Barkod Girişi -->
            <RowDefinition Height="*"/>    <!-- Master-Detail Sipariş Tablosu -->
        </Grid.RowDefinitions>

        <!-- 1. BARKODLU OKUMA VE FİLTRE ÇUBUĞU -->
        <Border Grid.Row="0" Style="{StaticResource ModernCardStyle}" Margin="0,0,0,16" Padding="12">
            <Grid>
                <Grid.ColumnDefinitions>
                    <ColumnDefinition Width="Auto"/>
                    <ColumnDefinition Width="300"/>
                    <ColumnDefinition Width="*"/>
                    <ColumnDefinition Width="Auto"/>
                </Grid.ColumnDefinitions>

                <TextBlock Text="🔍 Barkod / Sipariş No Oku:" FontWeight="Bold" Foreground="{StaticResource PrimaryAccentBrush}"
                           VerticalAlignment="Center" Margin="0,0,12,0"/>
                
                <TextBox Grid.Column="1" Text="{Binding BarcodeScanInput, UpdateSourceTrigger=PropertyChanged}"
                         Padding="10,6" Background="#0B1120" Foreground="{StaticResource TextPrimaryBrush}"
                         BorderBrush="{StaticResource PrimaryAccentBrush}" BorderThickness="1.5"
                         VerticalAlignment="Center"/>

                <StackPanel Grid.Column="3" Orientation="Horizontal">
                    <Button Content="Toplu Fatura & Fiş Kes (ERP)" Style="{StaticResource ModernPrimaryButton}"
                            Command="{Binding BulkInvoiceExportCommand}"/>
                </StackPanel>
            </Grid>
        </Border>

        <!-- 2. SİPARİŞLER DATAGRID -->
        <DataGrid Grid.Row="1" Style="{StaticResource FluentDataGridStyle}"
                  ItemsSource="{Binding Orders}" SelectedItem="{Binding SelectedOrder}">
            <DataGrid.Columns>
                <DataGridTextColumn Header="Sipariş No" Binding="{Binding OrderNumber}" Width="150" FontWeight="Bold"/>
                <DataGridTextColumn Header="Pazaryeri" Binding="{Binding Channel}" Width="110"/>
                <DataGridTextColumn Header="Müşteri Adı" Binding="{Binding CustomerName}" Width="*"/>
                <DataGridTextColumn Header="Kalem Adedi" Binding="{Binding ItemCount}" Width="100"/>
                <DataGridTextColumn Header="Tutar" Binding="{Binding TotalAmount, StringFormat='{}{0:N2} ₺'}" Width="120" FontWeight="Bold"/>
                <DataGridTextColumn Header="Kargo Firması" Binding="{Binding CargoProvider}" Width="130"/>
                <DataGridTextColumn Header="ERP Fiş No" Binding="{Binding ErpFicheNo}" Width="120" FontFamily="Consolas"/>
                <DataGridTextColumn Header="Durum" Binding="{Binding StatusText}" Width="120"/>
            </DataGrid.Columns>
        </DataGrid>
    </Grid>
</UserControl>`,
    viewModelCode: `using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using System.Collections.ObjectModel;

namespace OmniChannel.Wpf.ViewModels;

public partial class OrdersViewModel : ObservableObject
{
    [ObservableProperty]
    private string barcodeScanInput = string.Empty;

    [ObservableProperty]
    private OrderDto? selectedOrder;

    public ObservableCollection<OrderDto> Orders { get; } = new();

    public OrdersViewModel()
    {
        Orders.Add(new("TY-908124", "Trendyol", "Ahmet Demir", 2, 850.00m, "Trendyol Express", "FAT-2026-091", "Kargoya Hazır"));
        Orders.Add(new("HB-409182", "Hepsiburada", "Zeynep Çelik", 1, 320.50m, "HepsiJet", "FAT-2026-092", "Toplama Bekliyor"));
        Orders.Add(new("AMZ-88123", "Amazon TR", "Caner Yurt", 3, 1420.00m, "Kolay Gelsin", "", "Yeni Sipariş"));
    }

    [RelayCommand]
    private void BulkInvoiceExport()
    {
        // Logo / Netsis XML aktarım servisi
    }
}

public record OrderDto(string OrderNumber, string Channel, string CustomerName, int ItemCount, decimal TotalAmount, string CargoProvider, string ErpFicheNo, string StatusText);`
  },

  // 5. KARGO & BAREM MASASI (CARGO TARIFF DESK)
  {
    id: 'cargo',
    title: 'Kargo & Barem Masası (Desi Fiyat Simülatörü)',
    category: 'Sipariş & Kargo',
    description: 'Pazaryeri ve kargo firması anlaşmalı barem matrisi. Desi artışlarına göre net kar/zarar hesabı ve maliyet simülatörü.',
    xamlFileName: 'Views/CargoTariffDeskView.xaml',
    viewModelFileName: 'ViewModels/CargoTariffDeskViewModel.cs',
    highlightFeatures: [
      'Pazaryeri anlaşmalı desi barem tablosu (0-1 Desi, 2-3 Desi vb.)',
      'Canlı kar marjı ve navlun simülatörü',
      'CSV / Excel formatında barem içe/dışa aktarma'
    ],
    xamlCode: `<UserControl x:Class="OmniChannel.Wpf.Views.CargoTariffDeskView"
             xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
             xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
             xmlns:vm="clr-namespace:OmniChannel.Wpf.ViewModels"
             Background="{StaticResource WindowBackgroundBrush}">

    <UserControl.DataContext>
        <vm:CargoTariffDeskViewModel />
    </UserControl.DataContext>

    <Grid Margin="24">
        <Grid.RowDefinitions>
            <RowDefinition Height="Auto"/>
            <RowDefinition Height="Auto"/>
            <RowDefinition Height="*"/>
        </Grid.RowDefinitions>

        <TextBlock Grid.Row="0" Text="Kargo & Barem Fiyat Masası (Desi Navlun Matrisi)" 
                   FontSize="22" FontWeight="Bold" Foreground="{StaticResource TextPrimaryBrush}" Margin="0,0,0,16"/>

        <!-- Simülatör Kartı -->
        <Border Grid.Row="1" Style="{StaticResource ModernCardStyle}" Margin="0,0,0,20">
            <UniformGrid Columns="4">
                <StackPanel Margin="0,0,12,0">
                    <TextBlock Text="Test Edilecek Desi:" Foreground="{StaticResource TextSecondaryBrush}"/>
                    <TextBox Text="{Binding TestDesi, UpdateSourceTrigger=PropertyChanged}" Background="#0B1120" Foreground="White" Padding="8" Margin="0,4,0,0"/>
                </StackPanel>
                <StackPanel Margin="6,0,6,0">
                    <TextBlock Text="Kargo Firması:" Foreground="{StaticResource TextSecondaryBrush}"/>
                    <ComboBox ItemsSource="{Binding Carriers}" SelectedItem="{Binding SelectedCarrier}" Height="36" Margin="0,4,0,0"/>
                </StackPanel>
                <StackPanel Margin="6,0,6,0">
                    <TextBlock Text="Hesaplanan Navlun:" Foreground="{StaticResource TextSecondaryBrush}"/>
                    <TextBlock Text="{Binding CalculatedFreightCost, StringFormat='{}{0:N2} ₺'}" FontSize="20" FontWeight="Bold" Foreground="{StaticResource PrimaryAccentBrush}" Margin="0,8,0,0"/>
                </StackPanel>
                <StackPanel Margin="12,0,0,0">
                    <TextBlock Text="Önerilen Satış Fiyat Artışı:" Foreground="{StaticResource TextSecondaryBrush}"/>
                    <TextBlock Text="{Binding RecommendedPriceMarkup, StringFormat='+{0:N2} ₺'}" FontSize="20" FontWeight="Bold" Foreground="{StaticResource SuccessGreenBrush}" Margin="0,8,0,0"/>
                </StackPanel>
            </UniformGrid>
        </Border>

        <!-- Barem Tablosu -->
        <DataGrid Grid.Row="2" Style="{StaticResource FluentDataGridStyle}" ItemsSource="{Binding Tariffs}">
            <DataGrid.Columns>
                <DataGridTextColumn Header="Kanal" Binding="{Binding Channel}" Width="120"/>
                <DataGridTextColumn Header="Kargo Firması" Binding="{Binding Carrier}" Width="160"/>
                <DataGridTextColumn Header="Min Desi" Binding="{Binding MinDesi}" Width="90"/>
                <DataGridTextColumn Header="Max Desi" Binding="{Binding MaxDesi}" Width="90"/>
                <DataGridTextColumn Header="Sabit Ücret" Binding="{Binding BaseCost, StringFormat='{}{0:N2} ₺'}" Width="110"/>
                <DataGridTextColumn Header="Ek Desi Başı" Binding="{Binding ExtraDesiCost, StringFormat='{}{0:N2} ₺'}" Width="110"/>
            </DataGrid.Columns>
        </DataGrid>
    </Grid>
</UserControl>`,
    viewModelCode: `using CommunityToolkit.Mvvm.ComponentModel;
using System.Collections.ObjectModel;

namespace OmniChannel.Wpf.ViewModels;

public partial class CargoTariffDeskViewModel : ObservableObject
{
    [ObservableProperty]
    private double testDesi = 3.5;

    [ObservableProperty]
    private string selectedCarrier = "Yurtiçi Kargo";

    [ObservableProperty]
    private decimal calculatedFreightCost = 42.50m;

    [ObservableProperty]
    private decimal recommendedPriceMarkup = 51.00m;

    public ObservableCollection<string> Carriers { get; } = new() { "Yurtiçi Kargo", "Aras Kargo", "Trendyol Express", "HepsiJet" };
    public ObservableCollection<TariffDto> Tariffs { get; } = new();

    public CargoTariffDeskViewModel()
    {
        Tariffs.Add(new("Trendyol", "Trendyol Express", 0, 1.99, 28.50m, 4.00m));
        Tariffs.Add(new("Trendyol", "Yurtiçi Kargo", 2, 4.99, 42.50m, 6.50m));
        Tariffs.Add(new("Hepsiburada", "HepsiJet", 0, 2.99, 32.00m, 5.00m));
    }
}

public record TariffDto(string Channel, string Carrier, double MinDesi, double MaxDesi, decimal BaseCost, decimal ExtraDesiCost);`
  },

  // 6. MÜŞTERİ SORULARI & SLA MASASI (QUESTIONS VIEW)
  {
    id: 'questions',
    title: 'Müşteri Soruları & SLA Yanıtlama Masası',
    category: 'Müşteri & Finans',
    description: 'Pazaryeri müşteri soruları, SLA geri sayım saatleri, hazır AI şablonları ve hızlı yanıt konsolu.',
    xamlFileName: 'Views/QuestionsView.xaml',
    viewModelFileName: 'ViewModels/QuestionsViewModel.cs',
    highlightFeatures: [
      'SLA süresine göre renk değiştiren geri sayım badge kontrolü',
      'Tek tıkla hazır cevap şablonu yerleştirme',
      'Pazaryeri API doğrudan yanıtlama entegrasyonu'
    ],
    xamlCode: `<UserControl x:Class="OmniChannel.Wpf.Views.QuestionsView"
             xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
             xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
             xmlns:vm="clr-namespace:OmniChannel.Wpf.ViewModels"
             Background="{StaticResource WindowBackgroundBrush}">

    <UserControl.DataContext>
        <vm:QuestionsViewModel />
    </UserControl.DataContext>

    <Grid Margin="24">
        <Grid.ColumnDefinitions>
            <ColumnDefinition Width="420"/> <!-- Soru Listesi -->
            <ColumnDefinition Width="*"/>   <!-- Seçili Soru ve Yanıt Editörü -->
        </Grid.ColumnDefinitions>

        <!-- Sol: Soru Listesi -->
        <Border Grid.Column="0" Style="{StaticResource ModernCardStyle}" Margin="0,0,16,0">
            <DockPanel>
                <TextBlock DockPanel.Dock="Top" Text="Bekleyen Sorular (SLA Öncelikli)" 
                           FontSize="16" FontWeight="Bold" Foreground="{StaticResource TextPrimaryBrush}" Margin="0,0,0,12"/>
                <ListBox ItemsSource="{Binding PendingQuestions}" SelectedItem="{Binding SelectedQuestion}"
                         Background="Transparent" BorderThickness="0">
                    <ListBox.ItemTemplate>
                        <DataTemplate>
                            <Border Background="#111B2E" Padding="12" Margin="0,0,0,8" CornerRadius="8">
                                <StackPanel>
                                    <Grid>
                                        <TextBlock Text="{Binding Channel}" FontWeight="Bold" Foreground="{StaticResource PrimaryAccentBrush}"/>
                                        <TextBlock HorizontalAlignment="Right" Text="{Binding RemainingSla}" Foreground="{StaticResource WarningAmberBrush}" FontWeight="SemiBold"/>
                                    </Grid>
                                    <TextBlock Text="{Binding ProductTitle}" FontSize="11" Foreground="{StaticResource TextSecondaryBrush}" Margin="0,4,0,2"/>
                                    <TextBlock Text="{Binding QuestionText}" FontSize="12" Foreground="{StaticResource TextPrimaryBrush}" TextWrapping="Wrap"/>
                                </StackPanel>
                            </Border>
                        </DataTemplate>
                    </ListBox.ItemTemplate>
                </ListBox>
            </DockPanel>
        </Border>

        <!-- Sağ: Cevap Editörü -->
        <Border Grid.Column="1" Style="{StaticResource ModernCardStyle}">
            <Grid>
                <Grid.RowDefinitions>
                    <RowDefinition Height="Auto"/>
                    <RowDefinition Height="*"/>
                    <RowDefinition Height="Auto"/>
                </Grid.RowDefinitions>

                <StackPanel Grid.Row="0" Margin="0,0,0,16">
                    <TextBlock Text="Müşteri Sorusu ve Ürün Bilgisi" FontSize="16" FontWeight="Bold" Foreground="{StaticResource TextPrimaryBrush}"/>
                    <TextBlock Text="{Binding SelectedQuestion.QuestionText}" FontSize="13" Foreground="{StaticResource TextSecondaryBrush}" Margin="0,8,0,0"/>
                </StackPanel>

                <TextBox Grid.Row="1" Text="{Binding ReplyText, UpdateSourceTrigger=PropertyChanged}"
                         AcceptsReturn="True" TextWrapping="Wrap"
                         Background="#090E17" Foreground="{StaticResource TextPrimaryBrush}"
                         BorderBrush="{StaticResource BorderBrush}" Padding="14"/>

                <StackPanel Grid.Row="2" Orientation="Horizontal" HorizontalAlignment="Right" Margin="0,16,0,0">
                    <Button Content="Pazaryerine Yanıtı Gönder" Style="{StaticResource ModernPrimaryButton}"
                            Command="{Binding SubmitReplyCommand}"/>
                </StackPanel>
            </Grid>
        </Border>
    </Grid>
</UserControl>`,
    viewModelCode: `using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using System.Collections.ObjectModel;

namespace OmniChannel.Wpf.ViewModels;

public partial class QuestionsViewModel : ObservableObject
{
    [ObservableProperty]
    private QuestionDto? selectedQuestion;

    [ObservableProperty]
    private string replyText = "Merhaba, ürünümüz orijinal ambalajında ve faturalı olarak bugün kargoya verilecektir. İyi günler dileriz.";

    public ObservableCollection<QuestionDto> PendingQuestions { get; } = new();

    public QuestionsViewModel()
    {
        var q1 = new QuestionDto("Trendyol", "80 Derece Limon Kolonyası", "Ürünün son kullanma tarihi nedir?", "1 Sa 12 Dk");
        var q2 = new QuestionDto("Hepsiburada", "Hijyen Seti", "Hediye paketi yapabilir misiniz?", "2 Sa 40 Dk");
        PendingQuestions.Add(q1);
        PendingQuestions.Add(q2);
        SelectedQuestion = q1;
    }

    [RelayCommand]
    private async Task SubmitReplyAsync()
    {
        // Pazaryeri API yanıt gönderme servisi
        await Task.Delay(400);
        if (SelectedQuestion != null)
        {
            PendingQuestions.Remove(SelectedQuestion);
            SelectedQuestion = PendingQuestions.FirstOrDefault();
        }
    }
}

public record QuestionDto(string Channel, string ProductTitle, string QuestionText, string RemainingSla);`
  },

  // 7. MAĞAZA VE CANLI API AYARLARI (STORE SETTINGS)
  {
    id: 'stores',
    title: 'Mağaza Hesapları & Canlı API Masası',
    category: 'Sistem & API',
    description: 'Trendyol, Hepsiburada, Amazon, Çiçeksepeti, Pazarama API anahtarları, canlı bağlantı testi ve arka plan periyotları.',
    xamlFileName: 'Views/StoreSettingsView.xaml',
    viewModelFileName: 'ViewModels/StoreSettingsViewModel.cs',
    highlightFeatures: [
      'Şifrelenmiş PasswordBox / API Secret girişleri',
      'Canlı HTTP Bağlantı Testi (Ping & Auth Token doğrulama)',
      'Worker eşitleme frekans ayarları (1 dk - 60 dk)'
    ],
    xamlCode: `<UserControl x:Class="OmniChannel.Wpf.Views.StoreSettingsView"
             xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
             xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
             xmlns:vm="clr-namespace:OmniChannel.Wpf.ViewModels"
             Background="{StaticResource WindowBackgroundBrush}">

    <UserControl.DataContext>
        <vm:StoreSettingsViewModel />
    </UserControl.DataContext>

    <Grid Margin="24">
        <Grid.RowDefinitions>
            <RowDefinition Height="Auto"/>
            <RowDefinition Height="*"/>
        </Grid.RowDefinitions>

        <TextBlock Grid.Row="0" Text="Mağaza Hesapları & Pazaryeri Canlı API Entegrasyonu" 
                   FontSize="22" FontWeight="Bold" Foreground="{StaticResource TextPrimaryBrush}" Margin="0,0,0,16"/>

        <DataGrid Grid.Row="1" Style="{StaticResource FluentDataGridStyle}" ItemsSource="{Binding Stores}">
            <DataGrid.Columns>
                <DataGridTextColumn Header="Mağaza Adı" Binding="{Binding StoreName}" Width="180" FontWeight="SemiBold"/>
                <DataGridTextColumn Header="Kanal" Binding="{Binding Channel}" Width="120"/>
                <DataGridTextColumn Header="Satıcı / Tedarikçi ID" Binding="{Binding SellerId}" Width="150" FontFamily="Consolas"/>
                <DataGridTextColumn Header="API Key" Binding="{Binding ApiKeyMasked}" Width="160" FontFamily="Consolas"/>
                <DataGridTextColumn Header="Durum" Binding="{Binding ConnectionStatus}" Width="120"/>
                <DataGridTemplateColumn Header="İşlem" Width="140">
                    <DataGridTemplateColumn.CellTemplate>
                        <DataTemplate>
                            <Button Content="API Test Et" Padding="8,4" 
                                    Style="{StaticResource ModernPrimaryButton}"
                                    Command="{Binding DataContext.TestConnectionCommand, RelativeSource={RelativeSource AncestorType=UserControl}}"
                                    CommandParameter="{Binding}"/>
                        </DataTemplate>
                    </DataGridTemplateColumn.CellTemplate>
                </DataGridTemplateColumn>
            </DataGrid.Columns>
        </DataGrid>
    </Grid>
</UserControl>`,
    viewModelCode: `using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using System.Collections.ObjectModel;

namespace OmniChannel.Wpf.ViewModels;

public partial class StoreSettingsViewModel : ObservableObject
{
    public ObservableCollection<StoreAccountDto> Stores { get; } = new();

    public StoreSettingsViewModel()
    {
        Stores.Add(new("Trendyol Ana Mağaza", "Trendyol", "102941", "ty_live_key_****"));
        Stores.Add(new("Hepsiburada Satış", "Hepsiburada", "hb-merchant-84", "hb_sec_****"));
        Stores.Add(new("Amazon TR Pro", "Amazon TR", "A2948194", "amz_token_****"));
    }

    [RelayCommand]
    private async Task TestConnectionAsync(StoreAccountDto store)
    {
        store.ConnectionStatus = "Test Ediliyor...";
        await Task.Delay(500);
        store.ConnectionStatus = "Bağlantı Başarılı (200 OK)";
    }
}

public class StoreAccountDto : ObservableObject
{
    public string StoreName { get; set; }
    public string Channel { get; set; }
    public string SellerId { get; set; }
    public string ApiKeyMasked { get; set; }

    private string connectionStatus = "Bağlı";
    public string ConnectionStatus
    {
        get => connectionStatus;
        set => SetProperty(ref connectionStatus, value);
    }

    public StoreAccountDto(string name, string channel, string sellerId, string key)
    {
        StoreName = name;
        Channel = channel;
        SellerId = sellerId;
        ApiKeyMasked = key;
    }
}`
  }
];
